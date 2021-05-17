import Manager, { ManagerOptions } from './manager';
import connectFactory, { ConnectFunction } from './connect';

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

    const connect = connectFactory(stream);

    const dispatch: (value: any) => any = (value) => (
        stream.dispatch(value)
    );

    return { stream, connect, dispatch };
};

class StateStream {

    stream: Manager = null;
    connect: ConnectFunction = null;
    dispatch: (value: any) => any = null;

    constructor(initialState: AnyState, options?: ManagerOptions) {

        this.stream = new Manager(initialState, options || {});
        this.connect = connectFactory(this.stream);
        this.dispatch = (value) => (
            this.stream.dispatch(value)
        );

    }
}

export default StateStream;
