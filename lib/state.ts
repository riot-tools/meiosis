import Manager, { ManagerOptions } from './manager';
import ConnectFactory, { ConnectFunction } from './connect';

type AnyState = Object | Array<any> | String | Map<any,any> | Set<any>;

type updateFn = (value: any) => any;

export const createStateStream = (
    initialState: AnyState,
    options?: ManagerOptions
): {
    stream: Manager,
    connect: ConnectFunction,
    update: (value: any) => Manager
} => {

    const stream = new Manager(initialState, options || {});

    const connect = ConnectFactory(stream);

    const update: updateFn = (value) => stream.update(value);

    return { stream, connect, update };
};

export default createStateStream;
