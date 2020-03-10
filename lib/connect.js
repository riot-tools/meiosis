import { stateHasChanged } from './utils';
import { getState, getStream } from './state';

/**
 * Decorator for implement state management on a Riot component.
 * Application state is mapped to Component state, stream updates
 * generate component updates only when there are changes to the
 * relevant state, and component cleans up and  stops listening
 * to state changes onBeforeUnmount.
 * @param {function} mapToState - Required. Function to reduce application state to relevant app state
 * @param {function|object} mapToComponent - Optional. Map a function or object onto a component.
 */
export default function (mapToState, mapToComponent) {

    if (!mapToState || mapToState.constructor !== Function) {

        throw TypeError('mapToState must be a function');
    }

    if (mapToComponent && ![Function, Object].includes(mapToComponent.constructor)) {

        throw TypeError('mapToComponent must be a function or object');
    }


    /**
     * Connects a riot component to global app state.
     * Only updates component whenever there is a change to state.
     * @param {object} component - Riot component
     */
    return function (component) {

        const store = {
            update: null,
            componentState: null,
            componentProps: null,
            onBeforeMount: null,
            onBeforeUnmount: null,
            onUpdated: null
        };

        const stream = getStream();

        // Should only call update if state has changed
        store.listener = (newState) => {

            const { componentState, componentProps } = store;

            const change = mapToState(newState, componentState, componentProps);
            if (stateHasChanged(change, componentState)) store.update(change);
        };

        // store the original call if exists
        store.onBeforeMount = component.onBeforeMount;
        store.onBeforeUnmount = component.onBeforeUnmount;
        store.onUpdated = component.onUpdated;


        // Merge global state to local state.
        // Global state supersedes local state.
        component.onBeforeMount = function (props, state = {}) {

            store.update = (...args) => this.update.apply(this, args);

            // When state is updated, update component state.
            stream.on.value(store.listener);


            if (store.onBeforeMount) {
                store.onBeforeMount.apply(this, [props, state]);
            }

            state = { ...state, ...this.state };
3
            this.state = mapToState(getState(), state, props);
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
        component.onUpdated = function (props, state) {

            let retrn = true;
            if (store.onUpdated) {
                retrn = store.onUpdated.apply(this, [props, state]);
            }

            store.componentState = state;
            return retrn;
        };


        // wrap the onUnmounted callback to end the cloned stream
        // when the component will be unmounted
        component.onBeforeUnmount = function (...args) {


            if (store.onBeforeUnmount) {
                store.onBeforeUnmount.apply(this, args);
            }

            if (store.listener) {
                stream.off.value(store.listener);
            }
        };

        return component;
    };
};
