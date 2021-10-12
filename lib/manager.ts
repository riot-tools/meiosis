import { clone } from '@riot-tools/state-utils';

import {
    isUndefined,
    assertFunction,
    definePrivateProperties,
    deepFreeze,
    generateId
} from './helpers';


export type StateManagerOptions = {

    /** How many states changes to keep in memory */
    statesToKeep?: number;

    /** Removes states after reading */
    flushOnRead?: boolean;

    /** Parent stream */
    parent?: StateManager;

    /** Child stream should update parent stream */
    bidirectional?: boolean;
};

export type StateManagerState<State = any> = {

    state?: Readonly<State>;
    currentState?: number|null;
    latestState?: number|null;
    parentListener?: Function|null;
    childListener?: Function|null;
};

export interface ReducerFunction<State = any, Value = State> {
    (value: Partial<Value>, state?: State, ignore?: symbol): State | symbol
}

export type ListenerFunction<State = any> = (newState: State, oldState: State, flow?: StateManager[]) => void

// For skipping state modification
const IGNORE = Symbol();

const DEFAULT_OPTIONS: StateManagerOptions = {
    statesToKeep: 5
};

export class StateManager<State = any, ReducerValue = any> {

    _options: StateManagerOptions|null = null;

    private _id: number|null = null;
    private _sid = 0;

    private _stateId(): number {
        return this._sid++;
    }

    _internals: StateManagerState<State>;
    _states: Map<number, State>|null = null;

    _reducers: Set<ReducerFunction<ReducerValue, State>>|null = null;
    _listeners: Set<ListenerFunction<State>>|null = null;

    _parent: StateManager|null = null;

    constructor(initialState: any = {}, options: StateManagerOptions = {}) {

        definePrivateProperties(this, {

            // Holds state reducers
            _reducers: new Set(),

            // Holds listeners
            _listeners: new Set(),

            // Holds states
            _states: new Map(),

            _options: {
                ...DEFAULT_OPTIONS,
                ...options
            },

            _parent: options.parent || null,

            _id: generateId()
        })

        this._setupClone();
        this._addState(initialState);
    }

    private _setInternals(updates: StateManagerState<State>) {

        this._internals = {
            ...this._internals,
            ...updates
        };

        deepFreeze(this._internals);
    }

    private _addState(state: State) {

        const { statesToKeep } = this._options;
        const { _states } = this;

        if (statesToKeep && _states.size >= statesToKeep) {

            const { value: firstState } = _states.keys().next();
            _states.delete(firstState);
        }

        const currentState = this._stateId();

        // Initialize state to state holder
        _states.set(currentState, state);

        this._setInternals({
            currentState,
            latestState: currentState,
            state
        });
    }

    private _notifyListeners(newState: State, oldState: State, flow?: StateManager[]) {

        // Notify listeners
        for (const listener of this._listeners) {
            listener(newState, oldState, flow);
        }
    };

    /**
     * Pushes an update to the state.
     * @param value New state
     * @param {Array} flow This can be ignored. Tracks flow of incoming updates to prevent double updates on clones.
     */
    dispatch(value: ReducerValue, flow?: StateManager[]);
    dispatch(value: Partial<State>, flow?: StateManager[]) {

        /**
         * If the update is coming back to itself, do not update.
         */
        if (flow?.includes(this)) {
            return
        }

        const {
            _reducers,
            _listeners
        } = this;

        const {
            flushOnRead
        } = this._options;

        const valueIsUndefined = isUndefined(value);

        const currentState = this.state();
        let prevState;
        let nextState = valueIsUndefined ? currentState : value;



        // If no reducers present, state will be overwritten
        if (!valueIsUndefined && _reducers.size) {

            for (const reducer of _reducers) {

                const _modified = reducer(nextState, prevState || currentState, IGNORE);

                // Ignore modification if ignore symbol
                if (_modified === IGNORE) {

                    continue;
                }

                if (!isUndefined(_modified)) {

                    prevState = _modified;
                }
            }

            nextState = prevState;
        }

        // Save new state to holder
        if (!valueIsUndefined) {
            this._addState(nextState as State);
        }

        // Notify listeners
        if (_listeners.size) {
            this._notifyListeners(nextState as State, currentState, flow);

            if (flushOnRead) {
                this.flushStates();
            };
        }

        return this;
    }

    /**
     * Adds a function that modifies the dispatched state before registering it as a new state item.
     * You can add as many of these as you want.
     * @param {function} fn
     * @returns {StateManager} manager instance
     */
    addReducer(...fns: ReducerFunction[]){

        for (const fn of fns) {

            assertFunction('reducer', fn);

            // Save reducer to holder
            this._reducers.add(fn);
        }

        return this;
    }


    /**
     * Removes reducers from the state stream.
     * They will not longer modify the state once they are removed.
     * @param {function} fn
     * @returns {StateManager} manager instance
     */
    removeReducer(...fns: ReducerFunction[]) {

        for (const fn of fns) {

            if (this._reducers.has(fn)) {

                this._reducers.delete(fn);
            }
        }

        return this;
    };


    /**
     * Adds a listener that runs when updates are dispatched
     * @param {function} fns
     * @returns {StateManager} manager instance
     */
    addListener(...fns: ListenerFunction[]) {

        for (const fn of fns) {
            assertFunction('listener', fn);

            // Save listener to holder
            this._listeners.add(fn);
        }

        return this;
    }


    /**
     * Removes any attached listeners
     * @param {function} func
     * @returns {StateManager} manager instance
     */
    removeListener(...fns: ListenerFunction[]) {

        for (const fn of fns) {

            if (this._listeners.has(fn)) {

                this._listeners.delete(fn);
            }
        }

        return this;
    }


    /**
     * Returns an array of all stored states
     * @returns {array} Array of states
     */
    states() {

        return clone(Array.from(this._states.values()));
    }

    /**
     * Returns current state
     * @returns {*} Current state
     */
    state(): State {

        return clone(this._internals.state);
    }

    /**
     * Cleans all stored states, except current state.
     * State is reset if it wasn't on the current state
     */
    flushStates() {

        for (const key of this._states.keys()) {

            if (key === this._internals.currentState) {
                continue;
            }

            this._states.delete(key);
        }

        this.resetState();
    };

    /**
     * Sets the current state back to whatever it was. Useful for
     * where stepping forward and backwards between states and then
     * returning to your original state.
     */
    resetState() {

        const { _states, _internals } = this;
        const {
            currentState,
            latestState,
            state
        } = _internals;

        if (currentState === latestState) {
            return;
        }

        const oldState = state;
        const newState = _states.get(latestState);

        this._notifyListeners(newState, oldState);

        this._setInternals({
            currentState: latestState,
            state: newState
        });
    }

    /**
     * Travel to a particular state
     * @param sid state ID
     */
    goToState(sid: number) {

        const { _internals, _states } = this;
        const { state } = _internals;
        const { flushOnRead } = this._options;

        if (flushOnRead) {
            console.warn('cannot traverse states when flushOnRead option is set');
            return;
        }

        if (_states.has(sid)) {

            const oldState = state;
            const newState = _states.get(sid);

            this._notifyListeners(
                newState,
                oldState
            );

            this._setInternals({
                currentState: sid,
                state: newState
            });
        }
        else {

            console.warn(`state #${sid} does not exist`);
        }
    }

    /**
     * Go back 1 state. Does not work if `flushOnRead` is true.
     */
    prevState() {

        const { currentState } = this._internals;
        this.goToState(currentState - 1);
    }

    /**
     * Go forward 1 state. Does not work if `flushOnRead` is true.
     */
    nextState() {

        const { currentState } = this._internals;
        this.goToState(currentState + 1);
    }

    /**
     * Creates a child instance of manager. Receives parent's reducers
     * and will update whever parent is updated. Adding reducers and
     * listeners will not affect parent manager instance.
     *
     * @param {StateManagerOptions} options
     *
     * @returns {StateManager} manager instance
     */
    clone(options: StateManagerOptions = {}) {

        return new StateManager<State, ReducerValue>(
            this.state(),
            {
                ...this._options,
                ...options,
                parent: this
            }
        );
    }

    private _setupClone() {

        const self = this;
        const { _parent, _options } = this;

        if (!_parent) {
            return;
        }

        for (const reducer of _parent._reducers) {

            self._reducers.add(reducer);
        }

        /**
         * Add listener to parent to pass updates to cloned instance
         */
        const updateChild = (value, _, flow?: StateManager[]) => {

            if (flow) {
                flow.push(self);
            }

            self.dispatch(value, flow || [_parent]);
        };


        _parent.addListener(updateChild);

        self._setInternals({ parentListener: updateChild });


        if (_options.bidirectional) {

            /**
             * Add listener to child to pass updates to the parent.
             * This should notify parent that update is coming from
             * child in order to prevent maximum call stack.
             * @param value
             */
            const updateParent = (value: State, _: State, flow?: StateManager[]) => {

                if (flow) {
                    flow.push(self);
                }

                return _parent.dispatch(value, flow || [self]);
            };

            _parent._setInternals({ childListener: updateParent });

            self.addListener(updateParent);
        }
    }
}

export default StateManager;