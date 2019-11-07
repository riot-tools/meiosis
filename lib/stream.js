import Erre from 'erre';

import { setState, getState } from './state';

let stream;

/**
 * Returns application state stream
 */
export const getStream = () => stream;

/**
 * Creates a global state stream
 * @param {function} reducer Reducer that transforms incoming payloads into global state
 * @param {any} initialState Initial app state. Can be set to anything except `null` or `undefined`.
 */
export const createStream = (reducer, initialState) => {

    if (stream) {

        throw Error('stream has already been created');
    }

    if (!reducer || typeof reducer !== 'function') {

        throw TypeError('reducer must be a function');
    }

    if ([undefined, null].includes(initialState)) {

        throw TypeError('initial state cannot be undefined or null')
    }

    setState(initialState);

    stream = Erre((val) => {

        return setState(reducer(val, getState()));
    });

    return stream;
};