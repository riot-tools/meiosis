import Connect from './connect';
import * as StateHelpers from './state';
import * as StreamHelpers from './stream';
import * as Utilities from './utils';

export const utils = Utilities;
export const { getState } = StateHelpers;
export const { createStream, getStream } = StreamHelpers;
export const connect = Connect;

export default {
    utils,
    getState,
    createStream,
    getStream,
    connect
}