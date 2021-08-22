// TODO: parcel wants to pick up .ts version which doesnt resolve module correctly
import StateManager from '../dist/es';

const initialState = {
    buttonclicked: 0,
    items: [
        { text: 'try riot meioses', checked: true },
        { text: 'try rmdevtools', checked: false }
    ]
};

export const {
    stream,
    connect,
    dispatch
} = new StateManager(initialState, { statesToKeep: 100 });


const generalReducer = ({ buttonclicked }, oldState) => ({
    ...oldState,
    buttonclicked: buttonclicked || oldState.buttonclicked
});

const itemsReducer = ({ items }, oldState) => ({
    ...oldState,
    items: items || oldState.items
});

stream.addReducer(itemsReducer)
stream.addReducer(generalReducer);

