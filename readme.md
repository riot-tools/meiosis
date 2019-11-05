# Riot Meiosis

Meiosis state manager for Riot using Erre. [Learn more about meiosis](http://RiotMeiosis.js.org).

Key things to note:
- Implements a stream to update state
- Stream is accessible via component
- Component streams are clones of application stream
- Streams are ended and destroyed `onComponentUnmount`
- Plugin will prevent component updates if state has not changed
- State management is `opt-in`, so you don't get component state overwritten unless you explicitly want to

## Usage

```
npm i --save riot-meiosis
```

```js
const RiotMeiosis = require('riot-meiosis');

// Set your initial state.
// State is only mutable via manager API.
const state = {
    initial: true,
    isNew: true,
    mutable: false,
    nested: {
        hasCandy: true
    }
};

// Create the state manager.
// This will give you access to the stream, and functions that can be called from anywhere.
// Use them to construct your actions, get current state, and push to stream (which updates state and riot components)
const manager = RiotMeiosis.stateManager(state);
// > { getState, mergeState, stream, cloneStream }

// Create the riot plugin by passing manager.
// Plugin will tie a stream push to a riot update and update your state.
const plugin = RiotMeiosis.riotPlugin(manager);

// Install the state plugin
Riot.install(plugin);

// manage.stream is simply an Erre stream
manager.stream.push({
    initial: false,
    isNew: false
});

console.log(manager.getState());
// > {
//     initial: false,
//     isNew: false,
//     mutable: false,
//     nested: {
//         hasCandy: true
//     }
// }

```

In your `.riot` files:
```html

<myComponent>

    <p if={ hasCandy }>I have candy!</p>

    <script>

        export default {

            // This is required if you want to connect your component to state.
            // It is similar to react-redux's `connect`.
            // Also, if the new state is the same as the old state,
            // Your component will not update
            connect(newState, state) {


                return {
                    ...state,
                    ...newState.nested
                }
            },

            onBeforeMount() {

                // Can acccess the following:
                this.getState(); // Gets the entire app state
                this.stream // The cloned state stream. Only receives updates.
                this.mainStream // The application stream. Can be pushed updates
            }
        }
    </script>
</myComponent>
```

## State Manager

```js
const manager = RiotMeiosis.stateManager(state);
```


| Param | Type | Description |
| --- | --- | --- |
| getState | <code>function</code> | Returns entire application state |
| mergeState | <code>function</code> | Merges an object into current app state |
| stream | <code>object</code> | Main app [Erre stream](https://github.com/GianlucaGuarini/erre#api) |
| cloneStream | <code>object</code> | Clones application stream into a new stream |

 * @property {function} getState Returns entire application state
 * @property {function} mergeState Merges an object into current app state
 * @property {object} stream Main app Erre stream
 * @property {function} cloneStream Clones application stream
 */
