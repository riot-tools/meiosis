import {
    isUndefined,
    assertFunction,
    definePrivateProperties,
    deepFreeze,
    generateId
} from './utils/helpers';

import { clone } from './utils';

export type ManagerOptions = {

    /** How many states changes to keep in memory */
    statesToKeep?: number;

    /** Removes states after reading */
    flushOnRead?: boolean;

    /** Parent stream */
    parent?: Manager;

    /** Child stream should update parent stream */
    bidirectional?: boolean;
};

export type ManagerState = {

    state?: any;
    currentState?: number|null;
    latestState?: number|null;
    parentListener?: Function|null;
    childListener?: Function|null;
};

export type ModifierFunction = (value: any, state?: any, ignore?: symbol) => any

// For skipping state modification
const IGNORE = Symbol();

const DEFAULT_OPTIONS: ManagerOptions = {
    statesToKeep: 5
};

export class Manager {

    _options: ManagerOptions|null = null;

    private _id: number|null = null;
    private _sid = 0;

    private _stateId(): number {
        return this._sid++;
    }

    _internals: ManagerState;
    _states: Map<number, any>|null = null;

    _modifiers: Set<ModifierFunction>|null = null;
    _listeners: Set<Function>|null = null;

    _parent: Manager|null = null;

    constructor(initialState: any = {}, options: ManagerOptions = {}) {

        definePrivateProperties(this, {

            // Holds state modifiers
            _modifiers: new Set(),

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

    private _setInternals(updates: ManagerState) {

        this._internals = {
            ...this._internals,
            ...updates
        };

        deepFreeze(this._internals);
    }

    private _addState(state: any) {

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

    private _notifyListeners(newState: any, oldState: any, flow?: Manager[]) {

        // Notify listeners
        for (const listener of this._listeners) {
            listener(newState, oldState, flow);
        }
    };

    /**
     * Push an update
     * @param value New state
     * @param {Array} flow This can be ignored. Tracks flow of incoming updates to prevent double updates on clones.
     */
    update(value: any, flow?: Manager[]) {

        /**
         * If the update is coming back to itself, do not update.
         */
        if (flow?.includes(this)) {
            return
        }

        const {
            _modifiers,
            _listeners
        } = this;

        const {
            flushOnRead
        } = this._options;

        const valueIsUndefined = isUndefined(value);

        const currentState = this.state();
        let prevState;
        let nextState = valueIsUndefined ? currentState : value;



        // If no modifiers present, state will be overwritten
        if (!valueIsUndefined && _modifiers.size) {

            for (const modifier of _modifiers) {

                const _modified = modifier(nextState, prevState || currentState, IGNORE);

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
            this._addState(nextState);
        }

        // Notify listeners
        if (_listeners.size) {
            this._notifyListeners(nextState, currentState, flow);

            if (flushOnRead) {
                this.flushStates();
            };
        }

        return this;
    }

    /**
     * Function that modifies state.
     * Pass a function declaration for ability to return `this.IGNORE`
     * @param {function} func
     * @returns {Manager} Strom instance
     */
    modify(func: ModifierFunction){

        assertFunction('modifier', func);

        // Save modifier to holder
        this._modifiers.add(func);

        return this;
    }


    /**
     * Removes a modifier when passed existing function reference
     * @param {function} func
     * @returns {Manager} Strom instance
     */
    unmodify(func: ModifierFunction) {

        assertFunction('modifier', func);

        if (this._modifiers.has(func)) {

            this._modifiers.delete(func);
        }

        return this;
    };


    /**
     * Adds a listener that runs when stream update is executed
     * @param {function} func
     * @returns {Manager} Strom instance
     */
    listen(func: Function) {

        assertFunction('listener', func);

        // Save listener to holder
        this._listeners.add(func);

        return this;
    }


    /**
     * Removes a listener when passed existing function reference
     * @param {function} func
     * @returns {Manager} Strom instance
     */
    unlisten(func: Function) {

        assertFunction('listener', func);

        if (this._listeners.has(func)) {

            this._listeners.delete(func);
        }

        return this;
    }


    /**
     * Returns an array of all states
     * @returns {array} Array of states
     */
    states() {

        return Array.from(this._states.values());
    }

    /**
     * Returns current state
     * @returns {*} Current state
     */
    state() {

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

    private goToState(sid: number) {

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
     * Creates a child instance of Strom. Receives parent's modifiers
     * and will update whever parent is updated. Adding modifiers and
     * listeners will not affect parent Strom instance.
     *
     * @param {ManagerOptions} options
     *
     * @returns {Manager} Strom instance
     */
    clone(options: ManagerOptions = {}) {

        return new Manager(
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

        for (const mod of _parent._modifiers) {

            self._modifiers.add(mod);
        }

        /**
         * Add listener to parent to pass updates to cloned instance
         */
        const updateChild = (value: any, _: any, flow?: Manager[]) => {

            if (flow) {
                flow.push(self);
            }

            self.update(value, flow || [_parent]);
        };


        _parent.listen(updateChild);

        self._setInternals({ parentListener: updateChild });


        if (_options.bidirectional) {

            /**
             * Add listener to child to pass updates to the parent.
             * This should notify parent that update is coming from
             * child in order to prevent maximum call stack.
             * @param value
             */
            const updateParent = (value: any, _: any, flow?: Manager[]) => {

                if (flow) {
                    flow.push(self);
                }

                return _parent.update(value, flow || [self]);
            };

            _parent._setInternals({ childListener: updateParent });

            self.listen(updateParent);
        }
    }
}

export default Manager;