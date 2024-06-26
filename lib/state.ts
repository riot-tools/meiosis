import { RiotComponent } from "riot";
import { deepEqual } from '@riot-tools/state-utils';
import { makeOnBeforeUnmount, makeOnUpdated } from '@riot-tools/sak';

import StateManager, { ListenerFunction, StateManagerOptions } from './manager';
import { isFunctionOrObject } from './helpers';


export type AnyState = Object | Array<any> | String | Map<any,any> | Set<any>;

export interface MapToStateFunction<N, C, P> {
    (newState: N, componentState: C, componentProps: P): C
};

export interface MapToComponentFunction<P = any, S = any> {
    (props: P, state: S): Partial<P>
};

type ConnectedComponent<A, R, P, S> = (
    Partial<RiotMeiosisComponent<A, R>> &
    Partial<RiotComponent<P, S>>
)

type ConnectInternalStore<AppState, Props, State> = Partial<RiotComponent<Props, State>> & {
    componentState?: State,
    componentProps?: Props,
    listener?: {
        (newState: AppState): void
    },
};

export type RiotMeiosisComponent<AppState = any, ReducerVal = any> = {
    dispatch?: (value: AppState | ReducerVal) => void
};

export class RiotMeiosis<AppState, ReducerValue> {

    stream: StateManager<AppState, ReducerValue> = null;
    dispatch: StateManager<AppState, ReducerValue>['dispatch'] = null;
    addListener: (listener: ListenerFunction<AppState>) => { removeListener: Function };

    connect: (...args: Parameters<RiotMeiosis<AppState, ReducerValue>['__connect']>) => unknown

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

        this.connect = (...args) => self.__connect(...args);
    }

    private __wrapComponent <
        Props,
        State,
        C extends ConnectedComponent<AppState, ReducerValue, Props, State>
    >(
        component: C,
        mapToState: MapToStateFunction<AppState, State, Props>,
        mapToComponent?: MapToComponentFunction<Props, State>
    ): C {

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

                let assign = mapToComponent(props, state);

                if (typeof assign === 'object') {
                    Object.assign(component, assign);
                }
                else {
                    throw TypeError('mapToComponent must return an object');
                }
            }
        };

        makeOnUpdated <Props, State, C>(component, function(_props, state) {

            store.componentState = state;

            return true;
        });


        // wrap the onUnmounted callback to end the cloned stream
        // when the component will be unmounted
        makeOnBeforeUnmount <Props, State, C>(component, function (this: C, props, state) {

            if (store.onBeforeUnmount) {
                store.onBeforeUnmount.apply(this, [props, state]);
            }

            if (store.listener) {
                stateManager.removeListener(store.listener);
            }

            return this;
        });

        return component;
    };

    private __connect <Props = any, State = any>(
        mapToState: MapToStateFunction<AppState, State, Props>,
        mapToComponent?: MapToComponentFunction<Props, State>
    ) {

        if (!mapToState || mapToState.constructor !== Function) {

            throw TypeError('mapToState must be a function');
        }

        if (mapToComponent && !isFunctionOrObject(mapToComponent)) {

            throw TypeError('mapToComponent must be a function or object');
        }

        return <
            C extends ConnectedComponent<AppState, ReducerValue, Props, State>
        >(component: C) => (

            this.__wrapComponent <Props, State, C>(component, mapToState, mapToComponent)
        );
    }
}

export default RiotMeiosis;
