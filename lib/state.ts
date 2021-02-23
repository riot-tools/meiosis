import Manager, { ManagerOptions } from './manager';
import ConnectFactory, { ConnectFunction } from './connect';

type AnyState = Object | Array<any> | String | Map<any,any> | Set<any>;

export const createStateStream = (
    initialState: AnyState,
    options?: ManagerOptions
): {
    stream: Manager,
    connect: ConnectFunction,
    dispatch: (value: any) => Manager
} => {

    const stream = new Manager(initialState, options || {});

    const connect = ConnectFactory(stream);

    const dispatch: (value: any) => any = (value) => (
        stream.dispatch(value)
    );

    return { stream, connect, dispatch };
};

export default createStateStream;
