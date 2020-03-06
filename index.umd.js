(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.RiotMeiosis = {}));
}(this, function (exports) { 'use strict';

    const arrayMatches = (arr1, arr2) => {

        if (arr1.length !== arr2.length) {

            return false;
        }

        for (const item of arr1) {
            if (!arr2.includes(item)) {
                return false
            }    }

        return true;
    };

    const primitives = [
        String,
        Number,
        Boolean,
        Symbol,
        null,
        undefined
    ];

    const noConstructor = [
        null,
        undefined
    ];

    const stateHasChanged = (change, current) => {

        const currentKeys = Object.keys(current);
        const changeKeys = Object.keys(change);

        // If there are more keys in one than the other,
        // there is a change
        if (currentKeys.length !== changeKeys.length) {
            return true;
        }

        let hasChange = false;

        for (const key of currentKeys) {

            // If hasChange has changed to true, stop looping
            if (hasChange) {
                break;
            }

            // Make sure none of the keys have changed
            hasChange = !changeKeys.includes(key);
        }

        if (hasChange) return true;

        // Compare keys
        for (const key in current) {

            // Both objects must have key
            if (current.hasOwnProperty(key) && change.hasOwnProperty(key)) {

                const value = current[key];
                const compare = change[key];

                // If values are primitives, compare directly
                if (primitives.includes(value) || primitives.includes(value.constructor)) {

                    if (value !== compare) return true;
                }

                // If value is primitive, has no change, but does not have a constructor
                if (noConstructor.includes(value)) {

                    return false;
                }

                // If value constructor changes
                if (value.constructor !== compare.constructor) {

                    return true;
                }

                // Check that array does not match
                if (value.constructor === Array) {

                    hasChange = !arrayMatches(value, compare);
                    if (hasChange) return true;
                }

                // Recurse if value is an object
                if (typeof value === 'object') {

                    hasChange = stateHasChanged(value, compare);
                    if (hasChange) return true;
                }
            }
            else {
                return true;
            }
        }
    };

    var Utilities = /*#__PURE__*/Object.freeze({
        arrayMatches: arrayMatches,
        stateHasChanged: stateHasChanged
    });

    /**
     * Cancel token
     * @private
     * @type { Symbol }
     */
    const CANCEL = Symbol();

    /**
     * Helper that can be returned by ruit function to cancel the tasks chain
     * @returns { Symbol } internal private constant
     * @example
     *
     * ruit(
     *   100,
     *   num => Math.random() * num
     *   num => num > 50 ? ruit.cancel() : num
     *   num => num - 2
     * ).then(result => {
     *   console.log(result) // here we will get only number lower than 50
     * })
     *
     */
    ruit.cancel = () => CANCEL;

    /**
     * The same as ruit() but with the arguments inverted from right to left
     * @param   { * } tasks - list of tasks to process sequentially
     * @returns { Promise } a promise containing the result of the whole chain
     * @example
     *
     * const curry = f => a => b => f(a, b)
     * const add = (a, b) => a + b
     *
     * const addOne = curry(add)(1)
     *
     * const squareAsync = (num) => {
     *   return new Promise(r => {
     *     setTimeout(r, 500, num * 2)
     *   })
     * }
     *
     * // a -> a + a -> a * 2
     * // basically from right to left: 1 => 1 + 1 => 2 * 2
     * ruit.compose(squareAsync, addOne, 1).then(result => console.log(result)) // 4
     */
    ruit.compose = (...tasks) => ruit(...tasks.reverse());

    /**
     * Serialize a list of sync and async tasks from left to right
     * @param   { * } tasks - list of tasks to process sequentially
     * @returns { Promise } a promise containing the result of the whole chain
     * @example
     *
     * const curry = f => a => b => f(a, b)
     * const add = (a, b) => a + b
     *
     * const addOne = curry(add)(1)
     *
     * const squareAsync = (num) => {
     *   return new Promise(r => {
     *     setTimeout(r, 500, num * 2)
     *   })
     * }
     *
     * // a -> a + a -> a * 2
     * // basically from left to right: 1 => 1 + 1 => 2 * 2
     * ruit(1, addOne, squareAsync).then(result => console.log(result)) // 4
     */
    function ruit(...tasks) {
      return new Promise((resolve, reject) => {
        return (function run(queue, result) {
          if (!queue.length) return resolve(result)

          const [task, ...rest] = queue;
          const value = typeof task === 'function' ? task(result) : task;
          const done = v => run(rest, v);

          // check against nil values
          if (value != null) {
            if (value === CANCEL) return
            if (value.then) return value.then(done, reject)
          }

          return Promise.resolve(done(value))
        })(tasks)
      })
    }

    // Store the erre the API methods to handle the plugins installation
    const API_METHODS = new Set();
    const UNSUBSCRIBE_SYMBOL = Symbol();
    const UNSUBSCRIBE_METHOD = 'off';
    const CANCEL_METHOD = 'cancel';

    /**
     * Factory function to create the stream generator
     * @private
     * @param {Set} modifiers - stream input modifiers
     * @returns {Generator} the stream generator
     */
    function createStream(modifiers) {
      const stream = (function *stream() {
        while (true) {
          // get the initial stream value
          const input = yield;

          // run the input sequence
          yield ruit(input, ...modifiers);
        }
      })();

      // start the stream
      stream.next();

      return stream
    }

    /**
     * Dispatch a value to several listeners
     * @private
     * @param   {Set} callbacks - callbacks collection
     * @param   {*} value - anything
     * @returns {Set} the callbacks received
     */
    function dispatch(callbacks, value) {
      callbacks.forEach(f => {
        // unsubscribe the callback if erre.unsubscribe() will be returned
        if (f(value) === UNSUBSCRIBE_SYMBOL) callbacks.delete(f);
      });

      return callbacks
    }

    /**
     * Throw a panic error
     * @param {string} message - error message
     * @returns {Error} an error object
     */
    function panic(message) {
      throw new Error(message)
    }

    /**
     * Install an erre plugin adding it to the API
     * @param   {string} name - plugin name
     * @param   {Function} fn - new erre API method
     * @returns {Function} return the erre function
     */
    erre.install = function(name, fn) {
      if (!name || typeof name !== 'string')
        panic('Please provide a name (as string) for your erre plugin');
      if (!fn || typeof fn !== 'function')
        panic('Please provide a function for your erre plugin');

      if (API_METHODS.has(name)) {
        panic(`The ${name} is already part of the erre API, please provide a different name`);
      } else {
        erre[name] = fn;
        API_METHODS.add(name);
      }

      return erre
    };

    // alias for ruit canel to stop a stream chain
    erre.install(CANCEL_METHOD, ruit.cancel);

    // unsubscribe helper
    erre.install(UNSUBSCRIBE_METHOD, () => UNSUBSCRIBE_SYMBOL);

    /**
     * Stream constuction function
     * @param   {...Function} fns - stream modifiers
     * @returns {Object} erre instance
     */
    function erre(...fns) {
      const
        [success, error, end, modifiers] = [new Set(), new Set(), new Set(), new Set(fns)],
        generator = createStream(modifiers),
        stream = Object.create(generator),
        addToCollection = (collection) => (fn) => collection.add(fn) && stream,
        deleteFromCollection = (collection) => (fn) => collection.delete(fn) ? stream
          : panic('Couldn\'t remove handler passed by reference');

      return Object.assign(stream, {
        on: Object.freeze({
          value: addToCollection(success),
          error: addToCollection(error),
          end: addToCollection(end)
        }),
        off: Object.freeze({
          value: deleteFromCollection(success),
          error: deleteFromCollection(error),
          end: deleteFromCollection(end)
        }),
        connect: addToCollection(modifiers),
        push(input) {
          const { value, done } = stream.next(input);

          // dispatch the stream events
          if (!done) {
            value.then(
              res => dispatch(success, res),
              err => dispatch(error, err)
            );
          }

          return stream
        },
        end() {
          // kill the stream
          generator.return();
          // dispatch the end event
          dispatch(end)
          // clean up all the collections
          ;[success, error, end, modifiers].forEach(el => el.clear());

          return stream
        },
        fork() {
          return erre(...modifiers)
        },
        next(input) {
          // get the input and run eventually the promise
          const result = generator.next(input);

          // pause to the next iteration
          generator.next();

          return result
        }
      })
    }

    const stub = {
        state: null,
        stream: null
    };

    /**
     * Returns current application state
     */
    const getState = () => stub.state;

    /**
     * Sets global app state
     * @param {any} newState New state to be replaced
     */
    const setState = (newState) => {

        stub.state = newState;
        return stub.state;
    };


    /**
     * Returns application state stream
     */
    const getStream = () => stub.stream;

    /**
     * Creates a global state stream
     * @param {function} reducer Reducer that transforms incoming payloads into global state
     * @param {any} initialState Initial app state. Can be set to anything except `null` or `undefined`.
     */
    const createStream$1 = (reducer, initialState) => {

        if (stub.stream) {

            throw Error('stream has already been created');
        }

        if (!reducer || typeof reducer !== 'function') {

            throw TypeError('reducer must be a function');
        }

        if ([undefined, null].includes(initialState)) {

            throw TypeError('initial state cannot be undefined or null')
        }

        setState(initialState);

        stub.stream = erre((val) => {

            return setState(reducer(val, getState()));
        });

        return stub.stream;
    };

    var StateHelpers = /*#__PURE__*/Object.freeze({
        getState: getState,
        setState: setState,
        getStream: getStream,
        createStream: createStream$1
    });

    /**
     * Decorator for implement state management on a Riot component.
     * Application state is mapped to Component state, stream updates
     * generate component updates only when there are changes to the
     * relevant state, and component cleans up and  stops listening
     * to state changes onBeforeUnmount.
     * @param {function} mapToState - Required. Function to reduce application state to relevant app state
     * @param {function|object} mapToComponent - Optional. Map a function or object onto a component.
     */
    function Connect (mapToState, mapToComponent) {

        if (!mapToState || mapToState.constructor !== Function) {

            throw TypeError('mapToState must be a function');
        }

        if (mapToComponent && ![Function, Object].includes(mapToComponent.constructor)) {

            throw TypeError('mapToComponent must be a function or object');
        }


        /**
         * Connects a riot component to global app state.
         * Only updates component whenever there is a change to state.
         * @param {object} component - Riot component
         */
        return function (component) {

            let update;
            let componentState;
            let componentProps;
            const stream = getStream();

            // Should only call update if state has changed
            const listener = (newState) => {

                const change = mapToState(newState, componentState, componentProps);
                if (stateHasChanged(change, componentState)) update(change);
            };

            // store the original call if exists
            const { onBeforeMount, onBeforeUnmount, onUpdated } = component;

            // Merge global state to local state.
            // Global state supersedes local state.
            component.onBeforeMount = function (props, state = {}) {

                update = (...args) => this.update.apply(this, args);

                // When state is updated, update component state.
                stream.on.value(listener);


                if (onBeforeMount) {
                    onBeforeMount.apply(this, [props, state]);
                }

                state = { ...state, ...this.state };

                this.state = mapToState(getState(), state, props);
                componentState = this.state;
                componentProps = props;


                if (mapToComponent) {

                    if (typeof mapToComponent === 'function') {
                        mapToComponent = mapToComponent(props, state);
                    }

                    if (typeof mapToComponent === 'object') {
                        Object.assign(component, mapToComponent);
                    }
                    else {
                        throw TypeError('mapToComponent must return an object');
                    }
                }
            };

            // Capture the new state to avoid hoisting issues
            component.onUpdated = function (props, state) {

                let retrn = true;
                if (onUpdated) {
                    retrn = onUpdated.apply(this, [props, state]);
                }

                componentState = state;
                return retrn;
            };


            // wrap the onUnmounted callback to end the cloned stream
            // when the component will be unmounted
            component.onBeforeUnmount = function (...args) {

                if (onBeforeMount) {
                    onBeforeUnmount.apply(this, args);
                }
                stream.off.value(listener);
            };

            return component;
        };
    }

    var rmdevtools = ({ getStream, connect }) => {

    // Ommitted because of build script
    /** import { connect, getStream } from 'riot-meiosis'; */

    const urls = {
        js: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/7.0.4/jsoneditor.min.js",
        css: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/7.0.4/jsoneditor.min.css",
        fontawesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
    };

    const mkCss = (href) => {

        const link = document.createElement('link');
        link.setAttribute('href', href);
        link.setAttribute('rel', 'stylesheet');

        return link;
    };

    const mapToState = (app, ownState) => ({ ...ownState, app });

    const component = {

        state: {
            isOpen: false,
            editing: false,
            asTree: true,
            editorOpts: {
                mode: 'view',
                mainMenuBar: false
            }
        },
        loadScripts(cb) {

            const script = document.createElement('script');
            script.setAttribute('src', urls.js);

            script.onload = () => cb();

            document.head.appendChild(mkCss(urls.css));
            document.head.appendChild(mkCss(urls.fontawesome));
            document.body.appendChild(script);
        },
        toggleOpen() {

            this.update({ isOpen: !this.state.isOpen });
        },
        viewMode() {
            this.setMode('view', false);
        },
        textMode() {
            this.setMode('text', true, false);
        },
        treeMode() {
            this.setMode('tree', true);
        },
        setMode(mode, editing, asTree = true) {
            const { editorOpts } = this.state;
            editorOpts.mode = mode;
            this.update({ editing, editorOpts, asTree });
        },
        onSave() {
            const changes = this.editor.get();
            getStream().push(changes);
        },
        onMounted(_, state) {
            this.root.classList.add('closed');

            this.loadScripts(() => {

                this.ref = this.$('#tree');
                this.editor = new JSONEditor(this.ref, state.editorOpts);

                this.editor.set(state.app);
            });
        },
        onUpdated(_, state) {

            if (this.state.isOpen) {
                this.root.classList.remove('closed');
            }
            else {
                this.root.classList.add('closed');
            }

            if (!this.editor) {
                return;
            }

            this.editor.update(state.app);
            this.editor.setMode(state.editorOpts.mode);
        }
    };

    var rmdevtools = {
      'css': `rmdevtools,[is="rmdevtools"]{ display: block; position: fixed; bottom: 0; top: 0; right: 0; width: 400px; height: 100vh; background: rgba(250,250,250, 0.95); box-shadow: 0px 0px 10px rgba(0,0,0,0.2); transition: all 250ms; z-index: 9999; } rmdevtools table,[is="rmdevtools"] table{ margin: 0; } rmdevtools button,[is="rmdevtools"] button{ line-height: 1; } rmdevtools #container,[is="rmdevtools"] #container{ height: 100vh; overflow: auto; padding: 5px; padding-bottom: 35px; } rmdevtools .toggle,[is="rmdevtools"] .toggle{ position: absolute; bottom: 2px; border-radius: 2px; padding: 5px; background: #fff; border: 1px solid #eee; font-size: 16px; color: #6c0; box-shadow: 0px 0px 3px rgba(0,0,0,0.1); transition: all 250ms; } rmdevtools .toggle:hover,[is="rmdevtools"] .toggle:hover{ color: #6a0; box-shadow: 0px 0px 6px rgba(0,0,0,0.2); } rmdevtools .toggle.open,[is="rmdevtools"] .toggle.open{ left: -35px; z-index: 11; } rmdevtools .toggle.mode,[is="rmdevtools"] .toggle.mode{ right: 5px; z-index: 10; } rmdevtools .toggle.save,[is="rmdevtools"] .toggle.save{ right: 38px; z-index: 9; } rmdevtools .toggle.view,[is="rmdevtools"] .toggle.view{ left: 5px; z-index: 8; } rmdevtools.closed,[is="rmdevtools"].closed{ right: -400px; padding: 0; box-shadow: 0px 0px 0px rgba(0,0,0,0.2); } rmdevtools.closed h3,[is="rmdevtools"].closed h3{ font-size: 1rem; position: absolute; top: 0; right: 10px; } @media only screen and (max-width: 768px) { rmdevtools,[is="rmdevtools"]{ width: 280px; } rmdevtools.closed,[is="rmdevtools"].closed{ right: -280px; } }`,
      'exports': connect(mapToState)(component),

      'template': function(template, expressionTypes, bindingTypes, getComponent) {
        return template(
          '<a expr0="expr0" class="toggle open" title="Toggle state debugger"><i expr1="expr1" class="fa fa-eye-slash fa-fw"></i><i expr2="expr2" class="fa fa-eye fa-fw"></i></a><a expr3="expr3" class="toggle mode" title="Edit state"></a><a expr4="expr4" class="toggle mode" title="Cancel edit"></a><a expr5="expr5" class="toggle save" title="Save state"></a><a expr6="expr6" class="toggle view" title="Text mode"></a><a expr7="expr7" class="toggle view" title="Tree mode"></a><div id="container"><div id="tree"></div></div>',
          [{
            'redundantAttribute': 'expr0',
            'selector': '[expr0]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.toggleOpen;
              }
            }]
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.isOpen;
            },

            'redundantAttribute': 'expr1',
            'selector': '[expr1]',

            'template': template(null, [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'fa fa-eye-slash fa-fw';
                }
              }]
            }])
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return !scope.state.isOpen;
            },

            'redundantAttribute': 'expr2',
            'selector': '[expr2]',

            'template': template(null, [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'fa fa-eye fa-fw';
                }
              }]
            }])
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return !scope.state.editing;
            },

            'redundantAttribute': 'expr3',
            'selector': '[expr3]',

            'template': template('<i class="fa fa-edit fa-fw"></i>', [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'toggle mode';
                }
              }, {
                'type': expressionTypes.EVENT,
                'name': 'onclick',

                'evaluate': function(scope) {
                  return scope.treeMode;
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'title',

                'evaluate': function(scope) {
                  return 'Edit state';
                }
              }]
            }])
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.editing;
            },

            'redundantAttribute': 'expr4',
            'selector': '[expr4]',

            'template': template('<i class="fa fa-ban fa-fw"></i>', [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'toggle mode';
                }
              }, {
                'type': expressionTypes.EVENT,
                'name': 'onclick',

                'evaluate': function(scope) {
                  return scope.viewMode;
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'title',

                'evaluate': function(scope) {
                  return 'Cancel edit';
                }
              }]
            }])
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.editing;
            },

            'redundantAttribute': 'expr5',
            'selector': '[expr5]',

            'template': template('<i class="fa fa-save fa-fw"></i>', [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'toggle save';
                }
              }, {
                'type': expressionTypes.EVENT,
                'name': 'onclick',

                'evaluate': function(scope) {
                  return scope.onSave;
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'title',

                'evaluate': function(scope) {
                  return 'Save state';
                }
              }]
            }])
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.editing && scope.state.asTree;
            },

            'redundantAttribute': 'expr6',
            'selector': '[expr6]',

            'template': template('<i class="fa fa-code fa-fw"></i>', [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'toggle view';
                }
              }, {
                'type': expressionTypes.EVENT,
                'name': 'onclick',

                'evaluate': function(scope) {
                  return scope.textMode;
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'title',

                'evaluate': function(scope) {
                  return 'Text mode';
                }
              }]
            }])
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.editing && !scope.state.asTree;
            },

            'redundantAttribute': 'expr7',
            'selector': '[expr7]',

            'template': template('<i class="fa fa-tree fa-fw"></i>', [{
              'expressions': [{
                'type': expressionTypes.ATTRIBUTE,
                'name': 'class',

                'evaluate': function(scope) {
                  return 'toggle view';
                }
              }, {
                'type': expressionTypes.EVENT,
                'name': 'onclick',

                'evaluate': function(scope) {
                  return scope.treeMode;
                }
              }, {
                'type': expressionTypes.ATTRIBUTE,
                'name': 'title',

                'evaluate': function(scope) {
                  return 'Tree mode';
                }
              }]
            }])
          }]
        );
      },

      'name': 'rmdevtools'
    };

    return rmdevtools;

    };

    const utils = Utilities;
    const { createStream: createStream$2, getStream: getStream$1, getState: getState$1 } = StateHelpers;
    const connect = Connect;
    const RMDevTools = rmdevtools;

    var index = {
        utils,
        getState: getState$1,
        createStream: createStream$2,
        getStream: getStream$1,
        connect,
        RMDevTools
    };

    exports.RMDevTools = RMDevTools;
    exports.connect = connect;
    exports.createStream = createStream$2;
    exports.default = index;
    exports.getState = getState$1;
    exports.getStream = getStream$1;
    exports.utils = utils;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
