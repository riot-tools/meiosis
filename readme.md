
# Riot Meiosis <!-- omit in toc -->

Meiosis state manager for Riot using Erre. [Learn more about meiosis](http://RiotMeiosis.js.org).

- [Usage](#usage)
- [API](#api)
  - [`createStateStream(initialState, options)`](#createstatestreaminitialstate-options)
  - [`clone(object|array|map|set)`](#cloneobjectarraymapset)
  - [`diff(a, b)`](#diffa-b)
- [Instance API](#instance-api)
  - [`stream`](#stream)
  - [`dispatch(value)`](#dispatchvalue)
  - [`connect(mapToState, mapToComponent)(RiotComponent)`](#connectmaptostate-maptocomponentriotcomponent)
- [Stream API](#stream-api)
  - [`dispatch(update)`](#dispatchupdate)
  - [`addReducer(...Function[])`](#addreducerfunction)
  - [`removeReducer(...Function[])`](#removereducerfunction)
  - [`addListener(...Function[])`](#addlistenerfunction)
  - [`removeListener(...Function[])`](#removelistenerfunction)
  - [`states()`](#states)
  - [`state()`](#state)
  - [`flushStates()`](#flushstates)
  - [`resetState()`](#resetstate)
  - [`goToState(stateID)`](#gotostatestateid)
  - [`prevState()`](#prevstate)
  - [`nextState()`](#nextstate)
  - [`clone(ManagerOptions)`](#clonemanageroptions)
- [Typings](#typings)
  - [`createStateStream`](#createstatestream)
  - [`clone` and `diff`](#clone-and-diff)
  - [`Manager`](#manager)
  - [`ConnectFunction`](#connectfunction)

Key things to note:

- Implements a stream mechanism to update state
- Comes with a `connect` function to wrap stream functionality
- Components attempt to update when updates are dispatched
- Prevent component updates if state has not changed
- Stream listeners are destroyed when `onBeforeUnmount`

## Usage

```sh
npm i --save riot-meiosis
```

`./appState.js`

```js
import createStateStream from 'riot-meiosis';

// Set your initial state.
// State is only mutable via manager API.
const state = {
    initial: true,
    isNew: true,
    mutable: false,
    nested: {
        hasPasta: true
    }
};

// Root state reducer
const reducer = (newState, oldState) => ({
    ...oldState,
    ...newState
});

// Create global app state instance
const appState = createStateStream(state);

// Extract the state stream
const { stream } = appState;

stream.addReducer(reducer);

// stream is simply an Erre stream
stream.dispatch({
    initial: false,
    isNew: false
});

// Gets an immutable clone of the current state
console.log(stream.state());
// > {
//     initial: false,
//     isNew: false,
//     mutable: false,
//     nested: {
//         hasPasta: true
//     }
// }

export default appState;
```

In your `.riot` files:

```html

<myComponent>

    <p if={ hasPasta }>I have pasta!</p>

    <script>

        import { connect } from './appState';
        import myActions from './actions';

        const mapToState = (appState, ownState, ownProps) => ({
            ...ownState,
            ...appState.nested
        });

        // Optional mapping of functions or objects to component
        const mapToComponent = myActions;
        // OR
        const mapToComponent = (ownProps, ownState) => myActions;

        const component = {

            onBeforeMount() {

                // connect will respect original onBeforeMount
                this.state = {
                    lala: true
                }
            },

            onMounted() {

                // Component will have access to dispatch from lexical this
                this.dispatch({ myComponentMounted: true });
            }
        }

        export default connect(mapToState)(component);
        // OR
        export default connect(mapToState, mapToComponent)(component);
    </script>
</myComponent>
```

## API

```js

import createStateStream from 'riot-meiosis';
import { createStateStream, clone, diff } from 'riot-meiosis';

const appState = createStateStream(intialState, {
    statesToKeep?: 5,
    flushOnRead?: false
});

const {
    connect,
    stream,
    dispatch
} = appState;

const {
    dispatch,
    addReducer,
    removeReducer,
    addListener,
    removeListener,
    states,
    state,
    flushStates,
    resetState,
    goToState,
    prevState,
    nextState,
    clone
} = stream;

```

### `createStateStream(initialState, options)`

Creates an instance of an application state. Returns an object with `connect`, `stream,` and `dispatch`. See [Instance API](#instance-api).

### `clone(object|array|map|set)`

Generates a deep clone of any object or iterable.

### `diff(a, b)`

Compares two values to detect if there are any changes. Recursively traverses objects and iterables. Returns `true` as soon as a single change is detected, otherwise returns `false`. Does not compare memmory reference, but rather structure.

## Instance API

### `stream`

A state manager instance. This is what you use throughout your app to add listeners, reducers, and dispatch updated. See [Stream API](#stream-api).

### `dispatch(value)`

A shortcut to `stream.dispatch`.

### `connect(mapToState, mapToComponent)(RiotComponent)`

HOC that maps application state into component state. It listens for changes between the mapped state and triggers updates only if there are any changes. Optionally can map actions to the component via an object or function.

## Stream API

### `dispatch(update)`

Pushes an update to the state.

### `addReducer(...Function[])`

Adds a function that modifies the dispatched state before registering it as a new state item. You can add as many of these as you want.

```js

const usersReducer = function ({ users }, currentState, ignore) {

    if (!users) {
        return ignore;
    }

    currentState.users = {
        ...currentState.users,
        ...ignore
    };

    return currentState
};

const dataReducer = function ({ data }, currentState, ignore) {

    if (!data) {
        return ignore
    }

    currentState.data = someWeirdProcessing(data, currentState.data);

    return currentState;
};

stream.addReducer(
    usersReducer,
    dataReducer
);
```

### `removeReducer(...Function[])`

Removes reducers from the state stream. They will not longer modify the state once they are removed.

```js
stream.removeReducer(
    usersReducer,
    dataReducer
);
```

### `addListener(...Function[])`

Adds a listener that runs when updates are dispatched

```js
const someListener = (nextState, prevState) => {

    doSomething(nextState);
};

stream.addListener(
    someListener
);
```

### `removeListener(...Function[])`

Removes any attached listeners

```js
stream.removeListener(
    someListener
);
```

### `states()`

Returns an history of all saved states, if any are being kept. The amount returned is affect by `statesToKeep` and `flushOnRead` options.

### `state()`

Returns current state

### `flushStates()`

Cleans all stored states, except current state. State is reset if it wasn't on the current state.

### `resetState()`

Sets the current state back to whatever it was. Useful for where stepping forward and backwards between states and then returning to your original state.

### `goToState(stateID)`

Travel to a particular state. Does not work with `flushOnRead` option.

### `prevState()`

Go back 1 state. Does not work with `flushOnRead` option.

### `nextState()`

Go forward 1 state. Does not work with `flushOnRead` option.

### `clone(ManagerOptions)`

Creates a child instance of manager. Receives parent's reducers and will update whever parent is updated. Adding reducers and listeners will not affect parent manager instance.

```js

const clone = stream.clone({ bidirectional: true }); // parent receives updates from child


stream.dispatch({ childShouldReceive: true });

expect(clone.state().childShouldReceive).to.be.true();

clone.dispatch({ parentShouldReceive: true });

expect(stream.state().parentShouldReceive).to.be.true();
```

## Typings

### `createStateStream`

```ts
declare type AnyState = Object | Array<any> | String | Map<any, any> | Set<any>;

declare const createStateStream: (initialState: AnyState, options?: ManagerOptions) => {
    stream: Manager;
    connect: ConnectFunction;
    update: (value: any) => Manager;
};
```

### `clone` and `diff`

```ts
declare const clone: (original: any) => any;
declare const diff: (change: any, current: any) => boolean;
```

### `Manager`

```ts

declare type ManagerOptions = {
    /** How many states changes to keep in memory */
    statesToKeep?: number;
    /** Removes states after reading */
    flushOnRead?: boolean;
    /** Parent stream */
    parent?: Manager;
    /** Child stream should update parent stream */
    bidirectional?: boolean;
};

declare type ManagerState = {
    state?: any;
    currentState?: number | null;
    latestState?: number | null;
    parentListener?: Function | null;
    childListener?: Function | null;
};

declare type ModifierFunction = (value: any, state?: any, ignore?: symbol) => any;

declare class Manager {
    _options: ManagerOptions | null;
    private _id;
    private _sid;
    private _stateId;
    _internals: ManagerState;
    _states: Map<number, any> | null;
    _modifiers: Set<ModifierFunction> | null;
    _listeners: Set<Function> | null;
    _parent: Manager | null;
    constructor(initialState?: any, options?: ManagerOptions);
    private _setInternals;
    private _addState;
    private _notifyListeners;
    execs: number;
    update(value: any, flow?: Manager[]): this;
    modify(func: ModifierFunction): this;
    unmodify(func: ModifierFunction): this;
    listen(func: Function): this;
    unlisten(func: Function): this;
    states(): any[];
    state(): any;
    flushStates(): void;
    resetState(): void;
    private _stateStepper;
    prevState(): void;
    nextState(): void;
    clone(options?: ManagerOptions): Manager;
    private _setupClone;
}
```

### `ConnectFunction`

```ts
interface ConnectFunction {
    (component: RiotComponentExport): RiotComponentExport;
}
declare const connectFactory: (stateStream: Manager) => ConnectFunction;
```
