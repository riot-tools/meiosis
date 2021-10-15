import { RiotComponent } from "riot";
import { deepEqual } from '@riot-tools/state-utils';
import { makeOnBeforeUnmount, makeOnUpdated } from '@riot-tools/sak';

import StateManager, { ListenerFunction, StateManagerOptions } from './manager';
import { isFunctionOrObject } from './helpers';


export type AnyState = Object | Array<any> | String | Map<any,any> | Set<any>;

export interface MapToStateFunction<N, C, P> {
    (newState: N, componentState: C, componentProps: P): Partial<C>
};

export interface MapToComponentFunction<P, S> {
    (props: P, state: S): Partial<P>
};

type ConnectInternalStore<AppState, Props, State> = Partial<RiotComponent<Props, State>> & {
    componentState?: State,
    componentProps?: Props,
    listener?: {
        (newState: AppState): void
    },
};

export type RiotMeiosisComponent<AppState = any, ReducerVal = any, Props = any, State = any> = {
    dispatch: (value: AppState | ReducerVal) => void
} & Partial<RiotComponent<Props, State>>;

export class RiotMeiosis<AppState, ReducerValue> {

    stream?: StateManager<AppState, ReducerValue> = null;
    dispatch: StateManager<AppState, ReducerValue>['dispatch'] = null;
    addListener: (listener: ListenerFunction<AppState>) => { removeListener: Function };

    constructor(initialState: AppState, options?: StateManagerOptions) {

        const self = this;

        this.stream = new StateManager <AppState, ReducerValue>(initialState, options || {});

        this.dispatch = (value) => self.stream.dispatch(value);
        this.addListener = (listener) => {

            self.stream.addListener(listener);

            return {
                removeListener: () => (
                    self.stream.removeListener(listener)
                )
            };
        }
    }

    private __wrapComponent <
        Props,
        State,
        C extends RiotMeiosisComponent
    >(
        component: C,
        mapToState: MapToStateFunction<AppState, State, Props>,
        mapToComponent?: MapToComponentFunction<Props, State> | Partial<Props>
    ): C & RiotMeiosisComponent<AppState, ReducerValue, Props, State> {

        const stateManager = this.stream;

        const store: ConnectInternalStore<AppState, Props, State> = {
            update: null,
            componentState: null,
            componentProps: null,
            onBeforeMount: component.onBeforeMount || null,
            onBeforeUnmount: component.onBeforeUnmount || null,
            onUpdated: component.onUpdated || null
        };

        // Should only call update if state has changed
        store.listener = (newState) => {

            const { componentState, componentProps } = store;

            const change = mapToState(newState, componentState, componentProps);

            const isEqual = deepEqual(change, componentState);

            if (!isEqual) store.update(change);
        };

        // Dispatch directly from the component
        component.dispatch = (value) => stateManager.dispatch(value);

        // Merge global state to local state.
        // Global state supersedes local state.
        component.onBeforeMount = function (props, state) {

            store.update = (...args: any[]) => this.update.apply(this, args);

            // When state is updated, update component state.
            stateManager.addListener(store.listener);


            if (store.onBeforeMount) {
                store.onBeforeMount.apply(this, [props, state]);
            }

            state = { ...state, ...this.state };

            this.state = mapToState(stateManager.state(), state, props);
            store.componentState = this.state;
            store.componentProps = props;


            if (mapToComponent) {

                if (typeof mapToComponent === 'function') {
                    mapToComponent = mapToComponent(props, state);
                }

                if (typeof mapToComponent === 'object') {
                    Object.assign(component, mapToComponent);
                }
                else {
                    throw TypeError('mapToComponent must return an object');
                }
            }
        };

        makeOnUpdated(component, function(_props, state) {

            store.componentState = state;

            return true;
        });


        // wrap the onUnmounted callback to end the cloned stream
        // when the component will be unmounted
        makeOnBeforeUnmount(component, function (...args: any[]) {

            if (store.onBeforeUnmount) {
                store.onBeforeUnmount.apply(this, args);
            }

            if (store.listener) {
                stateManager.removeListener(store.listener);
            }

            return this;
        });

        return component;
    };

    connect <State = any, Props = any>(
        mapToState: MapToStateFunction<AppState, State, Props>,
        mapToComponent?: MapToComponentFunction<Props, State>|Props
    ) {

        if (!mapToState || mapToState.constructor !== Function) {

            throw TypeError('mapToState must be a function');
        }

        if (mapToComponent && !isFunctionOrObject(mapToComponent)) {

            throw TypeError('mapToComponent must be a function or object');
        }

        return <C extends RiotMeiosisComponent<AppState, ReducerValue, State, Props>>(component: C) => (
            this.__wrapComponent(component, mapToState, mapToComponent)
        );
    }

}

export default RiotMeiosis;
