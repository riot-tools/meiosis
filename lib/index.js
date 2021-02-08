import Connect from './connect';
import * as StateHelpers from './state';
import rmdevtools from './rmdevtools';

export const { createStream, getStream, getState, update } = StateHelpers;
export const connect = Connect;
export const RMDevTools = rmdevtools;

export default {
    getState,
    createStream,
    getStream,
    update,
    connect,
    RMDevTools
};
