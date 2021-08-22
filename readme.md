
# Riot Meiosis <!-- omit in toc -->

<a href="https://riot-tools.github.io/meiosis/getting-started"><h2>Full documentation can be found here</h2></a>

```sh
npm i --save @riot-tools/meiosis
```

---

## `./appState.js`

```ts
import { RiotMeiosis } from '@riot-tools/meiosis';

// can be an object
const state = {
    initial: true,
    isNew: true,
    mutable: false,
    nested: {
        hasPasta: true
    }
};

// can be a map
const state = new Map([

    ['init', true],
    ['mutable', true],
    ['nested', {
        hasPasta: true
    }]
])

// merge the states when object
const reducer = (newState: object, oldState: object) => ({
    ...oldState,
    ...newState
});

// merge the states when map
const reducer = (newState: object, oldState: Map) => {

    for (const [key, value] of Object.entries(newState)) {

        oldState.set(key, value);
    }

    return oldState;
}

const stateManager = new RiotMeiosis(state);

// Extract the state stream
const { stream } = stateManager;

// Add your state reducer
stream.addReducer(reducer);



// send updated
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

export default stateManager;
```

## `mycomponent.riot`

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

## Have many state managers

```ts

const stateManager1 = new RiotMeiosis(state1);
const stateManager2 = new RiotMeiosis(state2);

stateManager1.dispatch({ weee: true });
stateManager2.dispatch({ wooo: true });

```

## You do wierd things

```ts
const state = {
    // ...
};


const genericReducer = (newState: object, oldState: object, ignore: Symbol) => {

    if (newState.$set) {
        return ignore;
    }

    return {
        ...oldState,
        ...newState
    }
};

const setterReducer = (newState: object, oldState: object, ignore: Symbol) => {

    if (!newState.$set) {
        return ignore;
    }

    lodash.set(oldState, newState.$set, newState.$update);

    return oldState;
};

const stateManager = new RiotMeiosis(state);

stateManager.addReducer(genericReducer, setterReducer);

stateManager.dispatch({

    $set: 'some.nested.value',
    $update: {
        name: 'pepe',
        email: 'pepe@popo.pi'
    }
});

```


## Go back in time

```ts

const stateManager = new RiotMeiosis(state, { statesToKeep: 20 });

stateManager.dispatch({ ... });
stateManager.dispatch({ ... });
stateManager.dispatch({ ... });
stateManager.dispatch({ ... });
stateManager.dispatch({ ... });
stateManager.dispatch({ ... });

// Sends update to all listeners
stateManager.prevState();
stateManager.nextState();
stateManager.goToState(2);
stateManager.resetState();
```

## Listen for incoming changes

```ts

const stateSpy = (newState, oldState) => {

    console.log(newState);
};

stateManager.addListener(stateSpy);
```

---

<a href="https://riot-tools.github.io/meiosis/getting-started"><h2>Full documentation can be found here</h2></a>
