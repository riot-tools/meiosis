import Connect from './connect';
import * as StateHelpers from './state';
import * as Utilities from './utils';
import rmdevtools from './rmdevtools';

export const utils = Utilities;
export const { createStream, getStream, getState } = StateHelpers;
export const connect = Connect;
export const RMDevTools = rmdevtools;

export default {
    utils,
    getState,
    createStream,
    getStream,
    connect,
    RMDevTools
}