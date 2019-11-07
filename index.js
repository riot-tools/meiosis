import connect from './lib/connect';
import { getState } from './lib/state';
import { createStream, getStream } from './lib/stream';
import * as utils from './lib/utils';

console.log('createStream', createStream)

export default {
    connect,
    getState,
    createStream,
    getStream,
    utils
};
