// TODO: parcel wants to pick up .ts version which doesnt resolve module correctly
import { RiotMeiosis } from '..';

const initialState = {
    buttonclicked: 0,
    items: [
        { text: 'try riot meioses', checked: true },
        { text: 'try rmdevtools', checked: false }
    ]
};

export type StateType = typeof initialState;
export type ReducerVal = Partial<StateType>;

export const {
    stream,
    dispatch,
    connect,
    addListener
} = new RiotMeiosis<StateType, ReducerVal>(initialState, { statesToKeep: 100 });

const generalReducer = ({ buttonclicked }: ReducerVal, oldState: StateType) => ({
    ...oldState,
    buttonclicked: buttonclicked || oldState.buttonclicked
});

const itemsReducer = ({ items }: ReducerVal, oldState: StateType) => ({
    ...oldState,
    items: items || oldState.items
});

stream.addReducer(itemsReducer)
stream.addReducer(generalReducer);

