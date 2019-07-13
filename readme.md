# Riot Meiosis

Meiosis state manager for Riot using Erre. [Learn more about meiosis](http://meiosis.js.org).

## Usage

```
npm i --save riot-meiosis
```

```js
const Meiosis = require('riot-meiosis');

// Set your initial state. State is only mutable via manager API.
const state = {
    initial: true,
    isNew: true,
    mutable: false
};

// Create the state manager. This will give you access to the stream, and functions that can be called from anywhere. Use them to construct your actions, get current state, and push to stream (which updates state and riot components)

const manager = Meiosis.stateManager(state);
// { getState, mergeState, stream, cloneStream }

// Create the riot plugin by passing manager. Plugin will tie a stream push to a riot update and update your state.
const plugin = Meiosis.riotPlugin(manager);

// Install the state plugin
Riot.install(plugin);


manager.stream.push({
    initial: false,
    isNew: false
});

console.log(manager.getState());
// > {
//     initial: false,
//     isNew: false,
//     mutable: false
// }

```