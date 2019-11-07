import { stateHasChanged } from './utils';
import { getState } from './state';
import { getStream } from './stream';

/**
 * Decorator for implement state management on a Riot componenet.
 * Application state is mapped to Component state, stream updates
 * generate component updates only when there are changes to the
 * relevant state, and component cleans up and  stops listening
 * to state changes onBeforeUnmount.
 * @param {function} mapToState - Required function to reduce application state to relevant app state
 * @param {function|object} mapToComponent - Optionally, map a function or object onto a component
 */
export default function (mapToState, mapToComponent) {

    if (!mapToState || mapToState.constructor !== Function) {

        throw TypeError('mapToState must be a function');
    }

    if (mapToComponent && ![Function, Object].includes(mapToComponent.constructor)) {

        throw TypeError('mapToComponent must be a function or object');
    }

    const stream = getStream();

    /**
     * Connects a riot component to global app state.
     * Only updates component whenever there is a change to state.
     * @param {object} component - Riot component
     */
    return function (component) {

        // store the original onUnmounted call if it exists
        const { onBeforeMount, onBeforeUnmount, state } = component;

        // Merge global state to local state.
        // Global state supersedes local state.
        component.onBeforeMount = function (...args) {

            onBeforeMount(...args);
            this.state = mapToState(getState(), state);
        }

        // Should only call update if state has changed
        const listener = (newState) => {

            const { state } = component;
            const change = mapToState(newState, state);

            if (stateHasChanged(change, state)) component.update(change);
        };

        // wrap the onUnmounted callback to end the cloned stream
        // when the component will be unmounted
        component.onBeforeUnmount = function (...args) {

            onBeforeUnmount(...args);
            stream.off.value(listener);
        };

        // When state is updated, update component state.
        stream.on.value(listener);

        if (mapToComponent) {

            if (typeof mapToComponent === 'function') {

                mapToComponent = mapToComponent();
            }

            if (typeof mapToComponent === 'object') {

                Object.assign(component, mapToComponent);
            }
            else {

                throw TypeError('mapToComponent must return an object');
            }
        }

        return component;
    };
};
