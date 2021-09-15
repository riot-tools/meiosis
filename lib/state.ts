import { RiotComponent } from "riot";
import { deepEqual } from '@riot-tools/state-utils';
import { makeOnBeforeUnmount, makeOnUpdated } from '@riot-tools/sak';

import StateManager, { StateManagerOptions } from './manager';
import { isFunctionOrObject } from './helpers';


export type AnyState = Object | Array<any> | String | Map<any,any> | Set<any>;

export interface MapToStateFunction<N, C, P> {
    (newState: N, componentState: C, componentProps: P): any
};

export interface MapToComponentFunction<P, S> {
    (props: P, state: S): any
};

type ConnectInternalStore = {
    update?: RiotComponent['update'],
    componentState?: Object,
    componentProps?: Object,
    onBeforeMount?: RiotComponent['onBeforeMount'],
    onBeforeUnmount?: RiotComponent['onBeforeUnmount'],
    onUpdated?: RiotComponent['onUpdated'],
    listener?: {
        (newState: Object): any
    },
};

export type RiotMeiosisComponent = {
    dispatch: (value: any) => any,
    onBeforeMount?: RiotComponent['onBeforeMount'],
    onBeforeUnmount?: RiotComponent['onBeforeUnmount'];
    onUpdated?: RiotComponent['onUpdated'];
    update?: RiotComponent['update'];
};

export class RiotMeiosis {

    stream?: StateManager = null;

    constructor(initialState: AnyState, options?: StateManagerOptions) {

        this.stream = new StateManager(initialState, options || {});
    }

    private __wrapComponent <C>(
        component: C & RiotMeiosisComponent,
        mapToState: MapToStateFunction<any,any,any>,
        mapToComponent?: MapToComponentFunction<any,any>|Object
    ): C & RiotMeiosisComponent {

        const stateManager = this.stream;

        const store: ConnectInternalStore = {
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
        component.dispatch = (value: any) => stateManager.dispatch(value);

        // Merge global state to local state.
        // Global state supersedes local state.
        component.onBeforeMount = function (props: Object, state = {}) {

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

        makeOnUpdated(component, function <P, S>(_props: P, state: S) {

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

    connect(
        mapToState: MapToStateFunction<any,any,any>,
        mapToComponent?: MapToComponentFunction<any,any>|Object
    ) {

        if (!mapToState || mapToState.constructor !== Function) {

            throw TypeError('mapToState must be a function');
        }

        if (mapToComponent && !isFunctionOrObject(mapToComponent)) {

            throw TypeError('mapToComponent must be a function or object');
        }

        return <C>(component: C & RiotMeiosisComponent) => (
            this.__wrapComponent(component, mapToState, mapToComponent)
        );
    }

    dispatch(value: any) {

        return this.stream.dispatch(value);
    }
}

export default RiotMeiosis;
