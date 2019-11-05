import Erre from 'erre';

import './clone';

/**
 * @typedef {Object} StateManager
 * @property {function} getState Returns entire application state
 * @property {function} mergeState Merges an object into current app state
 * @property {object} stream Main app Erre stream
 * @property {function} cloneStream Clones application stream
 */

/**
 * Returns an API to manipulate application state using Erre streams.
 * @param {object} initialState Starting state object
 *
 * @return {StateManager} Functions to manage state
 */
export default function (initialState = {}) {

    const state = { ...initialState };

    const getState = () => state;
    const mergeState = (update) => ({ ...state, ...update });

    const stream = Erre(mergeState);

    const cloneStream = () => Erre.clone(stream);


    return {
        getState,
        mergeState,
        stream,
        cloneStream
    };
}