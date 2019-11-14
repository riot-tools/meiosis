import Erre from 'erre';


const stub = {
    state: null,
    stream: null
};

/**
 * Returns current application state
 */
export const getState = () => stub.state;

/**
 * Sets global app state
 * @param {any} newState New state to be replaced
 */
export const setState = (newState) => {

    stub.state = newState;
    return stub.state;
};


/**
 * Returns application state stream
 */
export const getStream = () => stub.stream;

/**
 * Creates a global state stream
 * @param {function} reducer Reducer that transforms incoming payloads into global state
 * @param {any} initialState Initial app state. Can be set to anything except `null` or `undefined`.
 */
export const createStream = (reducer, initialState) => {

    if (stub.stream) {

        throw Error('stream has already been created');
    }

    if (!reducer || typeof reducer !== 'function') {

        throw TypeError('reducer must be a function');
    }

    if ([undefined, null].includes(initialState)) {

        throw TypeError('initial state cannot be undefined or null')
    }

    setState(initialState);

    stub.stream = Erre((val) => {

        return setState(reducer(val, getState()));
    });

    return stub.stream;
};