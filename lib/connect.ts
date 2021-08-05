import { RiotComponent } from "riot";
import Manager from './manager';

import { deepEqual } from '@riot-tools/state-utils';
import { isFunctionOrObject } from './helpers';

export interface ConnectFunction {
    (component: RiotComponent): RiotComponent
};

interface ConnectInternalListener {
    (newState: Object): any
}

type ConnectInternalStore = {
    update: null | RiotComponent['update'];
    componentState: null | Object
    componentProps: null | Object;
    onBeforeMount: null | RiotComponent['onBeforeMount']
    onBeforeUnmount: null | RiotComponent['onBeforeUnmount'];
    onUpdated: null | RiotComponent['onUpdated'];
    listener?: ConnectInternalListener;
};

interface RiotMeiosisComponent extends RiotComponent {

    dispatch: (value: any) => any
}


/**
 * Decorator for implement state management on a Riot component.
 * Application state is mapped to Component state, stream updates
 * generate component updates only when there are changes to the
 * relevant state, and component cleans up and  stops listening
 * to state changes onBeforeUnmount.
 * @param {function} mapToState - Required. Function to reduce application state to relevant app state
 * @param {function|object} mapToComponent - Optional. Map a function or object onto a component.
 */
const connect = function (
    mapToState: Function,
    mapToComponent: Function | Object
): ConnectFunction {

    if (!mapToState || mapToState.constructor !== Function) {

        throw TypeError('mapToState must be a function');
    }

    if (mapToComponent && !isFunctionOrObject(mapToComponent)) {

        throw TypeError('mapToComponent must be a function or object');
    }

    /** Manager is bound to lexical this */
    const connection: Manager = this;

    /**
     * Connects a riot component to global app state.
     * Only updates component whenever there is a change to state.
     * @param {object} component - Riot component
     */
    return function (component: RiotMeiosisComponent) {

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
        component.dispatch = (value: any) => connection.dispatch(value);

        // Merge global state to local state.
        // Global state supersedes local state.
        component.onBeforeMount = function (props: Object, state = {}) {

            store.update = (...args: any[]) => this.update.apply(this, args);

            // When state is updated, update component state.
            connection.addListener(store.listener);


            if (store.onBeforeMount) {
                store.onBeforeMount.apply(this, [props, state]);
            }

            state = { ...state, ...this.state };

            this.state = mapToState(connection.state(), state, props);
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

        // Capture the new state to avoid hoisting issues
        component.onUpdated = function (props: Object, state: Object) {

            let retrn = true;
            if (store.onUpdated) {
                retrn = store.onUpdated.apply(this, [props, state]);
            }

            store.componentState = state;
            return retrn;
        };


        // wrap the onUnmounted callback to end the cloned stream
        // when the component will be unmounted
        component.onBeforeUnmount = function (...args: any[]) {

            if (store.onBeforeUnmount) {
                store.onBeforeUnmount.apply(this, args);
            }

            if (store.listener) {
                connection.removeListener(store.listener);
            }
        };

        return component;
    };
};


export const connectFactory = function (
    stateStream: Manager
): ConnectFunction {

    return connect.bind(stateStream);
};

export default connectFactory;
