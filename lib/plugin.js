/**
 * Returns a Riot plugin for installing meiosis state management
 * inside riot components. Original stream is cloned, and stream
 * is ended and removed once component is unmounted.
 * @param {object} stateManager - Instantiated state manager
 */
export default function ({ getState, cloneStream, stream }) {

    /**
     * Merges component state and global state and gives
     * components access to local stream and global stream.
     * Both stream produce updates to state, however, local stream
     * should only dispatch to local values, while global stream
     * would trigger updates to all subscribed components
     * https://github.com/riot/riot/issues/2708#issuecomment-501443045 *
     */
    return function (component) {

        // store the original onUnmounted call if it exists
        const { onUnmounted, state } = component;

        // Merge global state to local state.
        // Global state supersedes local state.
        component.state = {
            ...state,
            ...getState()
        };

        // Allow getting current state
        component.getState = getState;

        // clone the main stream and link in case you need local updates in your component
        component.stream = cloneStream();

        // link the main stream in case you want to dispatch global events
        component.mainStream = stream;

        // wrap the onUnmounted callback to end the cloned stream
        // when the component will be unmounted
        component.onUnmounted = (...args) => {

            onUnmounted.apply(component, args);
            component.stream.end();
        };

        // When state is updated, update component state.
        component.stream.on.value(newState => component.update(newState));
    };
};