let state;

/**
 * Returns current application state
 */
export const getState = () => state;

/**
 * Sets global app state
 * @param {any} newState New state to be replaced
 */
export const setState = (newState) => {

    state = newState;

    return state;
};