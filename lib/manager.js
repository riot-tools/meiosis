import Erre from 'erre';

import './clone';

/**
 * Returns an API to manipulate application state using Erre streams.
 * @param {object} initialState - Starting state object
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