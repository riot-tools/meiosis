import StateManager, { StateManagerOptions } from './manager';
import connectFactory, { ConnectFunction } from './connect';

export type AnyState = Object | Array<any> | String | Map<any,any> | Set<any>;
export class RiotMeiosis {

    stream: StateManager = null;
    connect: ConnectFunction = null;
    dispatch: (value: any) => any = null;

    constructor(initialState: AnyState, options?: StateManagerOptions) {

        this.stream = new StateManager(initialState, options || {});
        this.connect = connectFactory(this.stream);
        this.dispatch = (value) => (
            this.stream.dispatch(value)
        );
    }
}

export default RiotMeiosis;
