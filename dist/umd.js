/* RiotMeiosis, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RiotMeiosis = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var deepDiff = createCommonjsModule(function (module, exports) {

    (function (root, factory) {
      // eslint-disable-line no-extra-semi
      var deepDiff = factory(root); // eslint-disable-next-line no-undef

      {
        // Node.js or ReactNative
        module.exports = deepDiff;
      }
    })(commonjsGlobal, function (root) {
      var validKinds = ['N', 'E', 'A', 'D']; // nodejs compatible on server side and in the browser.

      function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }

      function Diff(kind, path) {
        Object.defineProperty(this, 'kind', {
          value: kind,
          enumerable: true
        });

        if (path && path.length) {
          Object.defineProperty(this, 'path', {
            value: path,
            enumerable: true
          });
        }
      }

      function DiffEdit(path, origin, value) {
        DiffEdit.super_.call(this, 'E', path);
        Object.defineProperty(this, 'lhs', {
          value: origin,
          enumerable: true
        });
        Object.defineProperty(this, 'rhs', {
          value: value,
          enumerable: true
        });
      }

      inherits(DiffEdit, Diff);

      function DiffNew(path, value) {
        DiffNew.super_.call(this, 'N', path);
        Object.defineProperty(this, 'rhs', {
          value: value,
          enumerable: true
        });
      }

      inherits(DiffNew, Diff);

      function DiffDeleted(path, value) {
        DiffDeleted.super_.call(this, 'D', path);
        Object.defineProperty(this, 'lhs', {
          value: value,
          enumerable: true
        });
      }

      inherits(DiffDeleted, Diff);

      function DiffArray(path, index, item) {
        DiffArray.super_.call(this, 'A', path);
        Object.defineProperty(this, 'index', {
          value: index,
          enumerable: true
        });
        Object.defineProperty(this, 'item', {
          value: item,
          enumerable: true
        });
      }

      inherits(DiffArray, Diff);

      function arrayRemove(arr, from, to) {
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        arr.push.apply(arr, rest);
        return arr;
      }

      function realTypeOf(subject) {
        var type = typeof subject;

        if (type !== 'object') {
          return type;
        }

        if (subject === Math) {
          return 'math';
        } else if (subject === null) {
          return 'null';
        } else if (Array.isArray(subject)) {
          return 'array';
        } else if (Object.prototype.toString.call(subject) === '[object Date]') {
          return 'date';
        } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
          return 'regexp';
        }

        return 'object';
      } // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/


      function hashThisString(string) {
        var hash = 0;

        if (string.length === 0) {
          return hash;
        }

        for (var i = 0; i < string.length; i++) {
          var char = string.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32bit integer
        }

        return hash;
      } // Gets a hash of the given object in an array order-independent fashion
      // also object key order independent (easier since they can be alphabetized)


      function getOrderIndependentHash(object) {
        var accum = 0;
        var type = realTypeOf(object);

        if (type === 'array') {
          object.forEach(function (item) {
            // Addition is commutative so this is order indep
            accum += getOrderIndependentHash(item);
          });
          var arrayString = '[type: array, hash: ' + accum + ']';
          return accum + hashThisString(arrayString);
        }

        if (type === 'object') {
          for (var key in object) {
            if (object.hasOwnProperty(key)) {
              var keyValueString = '[ type: object, key: ' + key + ', value hash: ' + getOrderIndependentHash(object[key]) + ']';
              accum += hashThisString(keyValueString);
            }
          }

          return accum;
        } // Non object, non array...should be good?


        var stringToHash = '[ type: ' + type + ' ; value: ' + object + ']';
        return accum + hashThisString(stringToHash);
      }

      function deepDiff(lhs, rhs, changes, prefilter, path, key, stack, orderIndependent) {
        changes = changes || [];
        path = path || [];
        stack = stack || [];
        var currentPath = path.slice(0);

        if (typeof key !== 'undefined' && key !== null) {
          if (prefilter) {
            if (typeof prefilter === 'function' && prefilter(currentPath, key)) {
              return;
            } else if (typeof prefilter === 'object') {
              if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {
                return;
              }

              if (prefilter.normalize) {
                var alt = prefilter.normalize(currentPath, key, lhs, rhs);

                if (alt) {
                  lhs = alt[0];
                  rhs = alt[1];
                }
              }
            }
          }

          currentPath.push(key);
        } // Use string comparison for regexes


        if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
          lhs = lhs.toString();
          rhs = rhs.toString();
        }

        var ltype = typeof lhs;
        var rtype = typeof rhs;
        var i, j, k, other;
        var ldefined = ltype !== 'undefined' || stack && stack.length > 0 && stack[stack.length - 1].lhs && Object.getOwnPropertyDescriptor(stack[stack.length - 1].lhs, key);
        var rdefined = rtype !== 'undefined' || stack && stack.length > 0 && stack[stack.length - 1].rhs && Object.getOwnPropertyDescriptor(stack[stack.length - 1].rhs, key);

        if (!ldefined && rdefined) {
          changes.push(new DiffNew(currentPath, rhs));
        } else if (!rdefined && ldefined) {
          changes.push(new DiffDeleted(currentPath, lhs));
        } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
          changes.push(new DiffEdit(currentPath, lhs, rhs));
        } else if (realTypeOf(lhs) === 'date' && lhs - rhs !== 0) {
          changes.push(new DiffEdit(currentPath, lhs, rhs));
        } else if (ltype === 'object' && lhs !== null && rhs !== null) {
          for (i = stack.length - 1; i > -1; --i) {
            if (stack[i].lhs === lhs) {
              other = true;
              break;
            }
          }

          if (!other) {
            stack.push({
              lhs: lhs,
              rhs: rhs
            });

            if (Array.isArray(lhs)) {
              // If order doesn't matter, we need to sort our arrays
              if (orderIndependent) {
                lhs.sort(function (a, b) {
                  return getOrderIndependentHash(a) - getOrderIndependentHash(b);
                });
                rhs.sort(function (a, b) {
                  return getOrderIndependentHash(a) - getOrderIndependentHash(b);
                });
              }

              i = rhs.length - 1;
              j = lhs.length - 1;

              while (i > j) {
                changes.push(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i--])));
              }

              while (j > i) {
                changes.push(new DiffArray(currentPath, j, new DiffDeleted(undefined, lhs[j--])));
              }

              for (; i >= 0; --i) {
                deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack, orderIndependent);
              }
            } else {
              var akeys = Object.keys(lhs);
              var pkeys = Object.keys(rhs);

              for (i = 0; i < akeys.length; ++i) {
                k = akeys[i];
                other = pkeys.indexOf(k);

                if (other >= 0) {
                  deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
                  pkeys[other] = null;
                } else {
                  deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack, orderIndependent);
                }
              }

              for (i = 0; i < pkeys.length; ++i) {
                k = pkeys[i];

                if (k) {
                  deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
                }
              }
            }

            stack.length = stack.length - 1;
          } else if (lhs !== rhs) {
            // lhs is contains a cycle at this element and it differs from rhs
            changes.push(new DiffEdit(currentPath, lhs, rhs));
          }
        } else if (lhs !== rhs) {
          if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
            changes.push(new DiffEdit(currentPath, lhs, rhs));
          }
        }
      }

      function observableDiff(lhs, rhs, observer, prefilter, orderIndependent) {
        var changes = [];
        deepDiff(lhs, rhs, changes, prefilter, null, null, null, orderIndependent);

        if (observer) {
          for (var i = 0; i < changes.length; ++i) {
            observer(changes[i]);
          }
        }

        return changes;
      }

      function orderIndependentDeepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
        return deepDiff(lhs, rhs, changes, prefilter, path, key, stack, true);
      }

      function accumulateDiff(lhs, rhs, prefilter, accum) {
        var observer = accum ? function (difference) {
          if (difference) {
            accum.push(difference);
          }
        } : undefined;
        var changes = observableDiff(lhs, rhs, observer, prefilter);
        return accum ? accum : changes.length ? changes : undefined;
      }

      function accumulateOrderIndependentDiff(lhs, rhs, prefilter, accum) {
        var observer = accum ? function (difference) {
          if (difference) {
            accum.push(difference);
          }
        } : undefined;
        var changes = observableDiff(lhs, rhs, observer, prefilter, true);
        return accum ? accum : changes.length ? changes : undefined;
      }

      function applyArrayChange(arr, index, change) {
        if (change.path && change.path.length) {
          var it = arr[index],
              i,
              u = change.path.length - 1;

          for (i = 0; i < u; i++) {
            it = it[change.path[i]];
          }

          switch (change.kind) {
            case 'A':
              applyArrayChange(it[change.path[i]], change.index, change.item);
              break;

            case 'D':
              delete it[change.path[i]];
              break;

            case 'E':
            case 'N':
              it[change.path[i]] = change.rhs;
              break;
          }
        } else {
          switch (change.kind) {
            case 'A':
              applyArrayChange(arr[index], change.index, change.item);
              break;

            case 'D':
              arr = arrayRemove(arr, index);
              break;

            case 'E':
            case 'N':
              arr[index] = change.rhs;
              break;
          }
        }

        return arr;
      }

      function applyChange(target, source, change) {
        if (typeof change === 'undefined' && source && ~validKinds.indexOf(source.kind)) {
          change = source;
        }

        if (target && change && change.kind) {
          var it = target,
              i = -1,
              last = change.path ? change.path.length - 1 : 0;

          while (++i < last) {
            if (typeof it[change.path[i]] === 'undefined') {
              it[change.path[i]] = typeof change.path[i + 1] !== 'undefined' && typeof change.path[i + 1] === 'number' ? [] : {};
            }

            it = it[change.path[i]];
          }

          switch (change.kind) {
            case 'A':
              if (change.path && typeof it[change.path[i]] === 'undefined') {
                it[change.path[i]] = [];
              }

              applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
              break;

            case 'D':
              delete it[change.path[i]];
              break;

            case 'E':
            case 'N':
              it[change.path[i]] = change.rhs;
              break;
          }
        }
      }

      function revertArrayChange(arr, index, change) {
        if (change.path && change.path.length) {
          // the structure of the object at the index has changed...
          var it = arr[index],
              i,
              u = change.path.length - 1;

          for (i = 0; i < u; i++) {
            it = it[change.path[i]];
          }

          switch (change.kind) {
            case 'A':
              revertArrayChange(it[change.path[i]], change.index, change.item);
              break;

            case 'D':
              it[change.path[i]] = change.lhs;
              break;

            case 'E':
              it[change.path[i]] = change.lhs;
              break;

            case 'N':
              delete it[change.path[i]];
              break;
          }
        } else {
          // the array item is different...
          switch (change.kind) {
            case 'A':
              revertArrayChange(arr[index], change.index, change.item);
              break;

            case 'D':
              arr[index] = change.lhs;
              break;

            case 'E':
              arr[index] = change.lhs;
              break;

            case 'N':
              arr = arrayRemove(arr, index);
              break;
          }
        }

        return arr;
      }

      function revertChange(target, source, change) {
        if (target && source && change && change.kind) {
          var it = target,
              i,
              u;
          u = change.path.length - 1;

          for (i = 0; i < u; i++) {
            if (typeof it[change.path[i]] === 'undefined') {
              it[change.path[i]] = {};
            }

            it = it[change.path[i]];
          }

          switch (change.kind) {
            case 'A':
              // Array was modified...
              // it will be an array...
              revertArrayChange(it[change.path[i]], change.index, change.item);
              break;

            case 'D':
              // Item was deleted...
              it[change.path[i]] = change.lhs;
              break;

            case 'E':
              // Item was edited...
              it[change.path[i]] = change.lhs;
              break;

            case 'N':
              // Item is new...
              delete it[change.path[i]];
              break;
          }
        }
      }

      function applyDiff(target, source, filter) {
        if (target && source) {
          var onChange = function (change) {
            if (!filter || filter(target, source, change)) {
              applyChange(target, source, change);
            }
          };

          observableDiff(target, source, onChange);
        }
      }

      Object.defineProperties(accumulateDiff, {
        diff: {
          value: accumulateDiff,
          enumerable: true
        },
        orderIndependentDiff: {
          value: accumulateOrderIndependentDiff,
          enumerable: true
        },
        observableDiff: {
          value: observableDiff,
          enumerable: true
        },
        orderIndependentObservableDiff: {
          value: orderIndependentDeepDiff,
          enumerable: true
        },
        orderIndepHash: {
          value: getOrderIndependentHash,
          enumerable: true
        },
        applyDiff: {
          value: applyDiff,
          enumerable: true
        },
        applyChange: {
          value: applyChange,
          enumerable: true
        },
        revertChange: {
          value: revertChange,
          enumerable: true
        },
        isConflict: {
          value: function () {
            return typeof $conflict !== 'undefined';
          },
          enumerable: true
        }
      }); // hackish...

      accumulateDiff.DeepDiff = accumulateDiff; // ...but works with:
      // import DeepDiff from 'deep-diff'
      // import { DeepDiff } from 'deep-diff'
      // const DeepDiff = require('deep-diff');
      // const { DeepDiff } = require('deep-diff');

      if (root) {
        root.DeepDiff = accumulateDiff;
      }

      return accumulateDiff;
    });
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
      return function run(queue, result) {
        if (!queue.length) return resolve(result);
        const [task, ...rest] = queue;
        const value = typeof task === 'function' ? task(result) : task;

        const done = v => run(rest, v); // check against nil values


        if (value != null) {
          if (value === CANCEL) return;
          if (value.then) return value.then(done, reject);
        }

        return Promise.resolve(done(value));
      }(tasks);
    });
  }

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
    const stream = function* stream() {
      while (true) {
        // get the initial stream value
        const input = yield; // run the input sequence

        yield ruit(input, ...modifiers);
      }
    }(); // start the stream


    stream.next();
    return stream;
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
    return callbacks;
  }
  /**
   * Throw a panic error
   * @param {string} message - error message
   * @returns {Error} an error object
   */


  function panic(message) {
    throw new Error(message);
  }
  /**
   * Install an erre plugin adding it to the API
   * @param   {string} name - plugin name
   * @param   {Function} fn - new erre API method
   * @returns {Function} return the erre function
   */


  erre.install = function (name, fn) {
    if (!name || typeof name !== 'string') panic('Please provide a name (as string) for your erre plugin');
    if (!fn || typeof fn !== 'function') panic('Please provide a function for your erre plugin');

    if (API_METHODS.has(name)) {
      panic(`The ${name} is already part of the erre API, please provide a different name`);
    } else {
      erre[name] = fn;
      API_METHODS.add(name);
    }

    return erre;
  }; // alias for ruit canel to stop a stream chain


  erre.install(CANCEL_METHOD, ruit.cancel); // unsubscribe helper

  erre.install(UNSUBSCRIBE_METHOD, () => UNSUBSCRIBE_SYMBOL);
  /**
   * Stream constuction function
   * @param   {...Function} fns - stream modifiers
   * @returns {Object} erre instance
   */

  function erre(...fns) {
    const [success, error, end, modifiers] = [new Set(), new Set(), new Set(), new Set(fns)],
          generator = createStream(modifiers),
          stream = Object.create(generator),
          addToCollection = collection => fn => collection.add(fn) && stream,
          deleteFromCollection = collection => fn => collection.delete(fn) ? stream : panic('Couldn\'t remove handler passed by reference');

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
        const {
          value,
          done
        } = stream.next(input); // dispatch the stream events

        if (!done) {
          value.then(res => dispatch(success, res), err => dispatch(error, err));
        }

        return stream;
      },

      end() {
        // kill the stream
        generator.return(); // dispatch the end event

        dispatch(end) // clean up all the collections
        ;
        [success, error, end, modifiers].forEach(el => el.clear());
        return stream;
      },

      fork() {
        return erre(...modifiers);
      },

      next(input) {
        // get the input and run eventually the promise
        const result = generator.next(input); // pause to the next iteration

        generator.next();
        return result;
      }

    });
  }

  var stub = {
    state: null,
    stream: null
  };
  /**
   * Returns current application state
   */

  var getState = function getState() {
    return stub.state;
  };
  /**
   * Sets global app state
   * @param {any} newState New state to be replaced
   */

  var setState = function setState(newState) {
    stub.state = newState;
    return stub.state;
  };
  /**
   * Returns application state stream
   */

  var getStream = function getStream() {
    return stub.stream;
  };
  /**
   * Creates a global state stream
   * @param {function} reducer Reducer that transforms incoming payloads into global state
   * @param {any} initialState Initial app state. Can be set to anything except `null` or `undefined`.
   */

  var createStream$1 = function createStream(reducer, initialState) {
    if (stub.stream) {
      throw Error('stream has already been created');
    }

    if (!reducer || typeof reducer !== 'function') {
      throw TypeError('reducer must be a function');
    }

    if ([undefined, null].includes(initialState)) {
      throw TypeError('initial state cannot be undefined or null');
    }

    setState(initialState);
    stub.stream = erre(function (val) {
      return setState(reducer(val, getState()));
    });
    return stub.stream;
  };

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
      var store = {
        update: null,
        componentState: null,
        componentProps: null,
        onBeforeMount: component.onBeforeMount,
        onBeforeUnmount: component.onBeforeUnmount,
        onUpdated: component.onUpdated
      };
      var stream = getStream(); // Should only call update if state has changed

      store.listener = function (newState) {
        var componentState = store.componentState,
            componentProps = store.componentProps;
        var change = mapToState(newState, componentState, componentProps);
        console.log({
          change: change,
          componentState: componentState
        });
        console.log(deepDiff(change, componentState));
        if (deepDiff(change, componentState)) store.update(change);
      }; // Merge global state to local state.
      // Global state supersedes local state.


      component.onBeforeMount = function (props) {
        var _this = this;

        var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        store.update = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this.update.apply(_this, args);
        }; // When state is updated, update component state.


        stream.on.value(store.listener);

        if (store.onBeforeMount) {
          store.onBeforeMount.apply(this, [props, state]);
        }

        state = _objectSpread2(_objectSpread2({}, state), this.state);
        this.state = mapToState(getState(), state, props);
        store.componentState = this.state;
        store.componentProps = props;

        if (mapToComponent) {
          if (typeof mapToComponent === 'function') {
            mapToComponent = mapToComponent(props, state);
          }

          if (_typeof(mapToComponent) === 'object') {
            Object.assign(component, mapToComponent);
          } else {
            throw TypeError('mapToComponent must return an object');
          }
        }
      }; // Capture the new state to avoid hoisting issues


      component.onUpdated = function (props, state) {
        var retrn = true;

        if (store.onUpdated) {
          retrn = store.onUpdated.apply(this, [props, state]);
        }

        store.componentState = state;
        return retrn;
      }; // wrap the onUnmounted callback to end the cloned stream
      // when the component will be unmounted


      component.onBeforeUnmount = function () {
        if (store.onBeforeUnmount) {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          store.onBeforeUnmount.apply(this, args);
        }

        if (store.listener) {
          try {
            stream.off.value(store.listener);
          } catch (e) {
            if (!/Couldn\'t remove handler passed by reference/.test(e.message)) {
              throw e;
            }
          }
        }
      };

      return component;
    };
  }

  var rmdevtools = (function (_ref) {
    var getStream = _ref.getStream,
        connect = _ref.connect;
    // Ommitted because of build script

    /** import { connect, getStream } from 'riot-meiosis'; */
    var urls = {
      js: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.1.9/jsoneditor.min.js",
      css: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.1.9/jsoneditor.min.css",
      fontawesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
    };

    var mkCss = function mkCss(href) {
      var link = document.createElement('link');
      link.setAttribute('href', href);
      link.setAttribute('rel', 'stylesheet');
      return link;
    };

    var mapToState = function mapToState(app, ownState) {
      return _objectSpread2(_objectSpread2({}, ownState), {}, {
        app: app
      });
    };

    var component = {
      state: {
        isOpen: false,
        editing: false,
        asTree: true,
        editorOpts: {
          mode: 'view',
          mainMenuBar: false
        }
      },
      loadScripts: function loadScripts(cb) {
        var script = document.createElement('script');
        script.setAttribute('src', urls.js);

        script.onload = function () {
          return cb();
        };

        document.head.appendChild(mkCss(urls.css));
        document.head.appendChild(mkCss(urls.fontawesome));
        document.body.appendChild(script);
      },
      toggleOpen: function toggleOpen() {
        this.update({
          isOpen: !this.state.isOpen
        });
      },
      viewMode: function viewMode() {
        this.setMode('view', false);
      },
      textMode: function textMode() {
        this.setMode('text', true, false);
      },
      treeMode: function treeMode() {
        this.setMode('tree', true);
      },
      setMode: function setMode(mode, editing) {
        var asTree = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var editorOpts = this.state.editorOpts;
        editorOpts.mode = mode;
        this.update({
          editing: editing,
          editorOpts: editorOpts,
          asTree: asTree
        });
      },
      onSave: function onSave() {
        var changes = this.editor.get();
        getStream().push(changes);
      },
      onMounted: function onMounted(_, state) {
        var _this = this;

        this.root.classList.add('closed');
        window.addEventListener('keydown', function (_ref2) {
          var keyCode = _ref2.keyCode;

          if (keyCode === 27) {
            _this.update({
              isOpen: false
            });
          }
        });
        this.loadScripts(function () {
          _this.ref = _this.$('#tree');
          _this.editor = new JSONEditor(_this.ref, state.editorOpts);

          _this.editor.set(state.app);
        });
      },
      onUpdated: function onUpdated(_, state) {
        if (this.state.isOpen) {
          this.root.classList.remove('closed');
        } else {
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
      'css': "rmdevtools,[is=\"rmdevtools\"]{ display: block; position: fixed; bottom: 0; top: 0; right: 0; width: 400px; height: 100vh; background: rgba(250,250,250, 0.95); box-shadow: 0px 0px 10px rgba(0,0,0,0.2); transition: all 250ms; z-index: 9999; } rmdevtools table,[is=\"rmdevtools\"] table{ margin: 0; } rmdevtools button,[is=\"rmdevtools\"] button{ line-height: 1; } rmdevtools #container,[is=\"rmdevtools\"] #container{ height: 100vh; overflow: auto; padding: 5px; padding-bottom: 35px; } rmdevtools .toggle,[is=\"rmdevtools\"] .toggle{ position: absolute; bottom: 2px; border-radius: 2px; padding: 5px; background: #fff; border: 1px solid #eee; font-size: 16px; color: #6c0; box-shadow: 0px 0px 3px rgba(0,0,0,0.1); transition: all 250ms; } rmdevtools .toggle:hover,[is=\"rmdevtools\"] .toggle:hover{ color: #6a0; box-shadow: 0px 0px 6px rgba(0,0,0,0.2); } rmdevtools .toggle.open,[is=\"rmdevtools\"] .toggle.open{ left: -35px; z-index: 11; } rmdevtools .toggle.mode,[is=\"rmdevtools\"] .toggle.mode{ right: 5px; z-index: 10; } rmdevtools .toggle.save,[is=\"rmdevtools\"] .toggle.save{ right: 38px; z-index: 9; } rmdevtools .toggle.view,[is=\"rmdevtools\"] .toggle.view{ left: 5px; z-index: 8; } rmdevtools.closed,[is=\"rmdevtools\"].closed{ right: -400px; padding: 0; box-shadow: 0px 0px 0px rgba(0,0,0,0.2); } rmdevtools.closed h3,[is=\"rmdevtools\"].closed h3{ font-size: 1rem; position: absolute; top: 0; right: 10px; } @media only screen and (max-width: 768px) { rmdevtools,[is=\"rmdevtools\"]{ width: 280px; } rmdevtools.closed,[is=\"rmdevtools\"].closed{ right: -280px; } }",
      'exports': connect(mapToState)(component),
      'template': function template(_template, expressionTypes, bindingTypes, getComponent) {
        return _template('<a expr0="expr0" class="toggle open" title="Toggle state debugger"><i expr1="expr1" class="fa fa-eye-slash fa-fw"></i><i expr2="expr2" class="fa fa-eye fa-fw"></i></a><a expr3="expr3" class="toggle mode" title="Edit state"></a><a expr4="expr4" class="toggle mode" title="Cancel edit"></a><a expr5="expr5" class="toggle save" title="Save state"></a><a expr6="expr6" class="toggle view" title="Text mode"></a><a expr7="expr7" class="toggle view" title="Tree mode"></a><div id="container"><div id="tree"></div></div>', [{
          'redundantAttribute': 'expr0',
          'selector': '[expr0]',
          'expressions': [{
            'type': expressionTypes.EVENT,
            'name': 'onclick',
            'evaluate': function evaluate(scope) {
              return scope.toggleOpen;
            }
          }]
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return scope.state.isOpen;
          },
          'redundantAttribute': 'expr1',
          'selector': '[expr1]',
          'template': _template(null, [])
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return !scope.state.isOpen;
          },
          'redundantAttribute': 'expr2',
          'selector': '[expr2]',
          'template': _template(null, [])
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return !scope.state.editing;
          },
          'redundantAttribute': 'expr3',
          'selector': '[expr3]',
          'template': _template('<i class="fa fa-edit fa-fw"></i>', [{
            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',
              'evaluate': function evaluate(scope) {
                return scope.treeMode;
              }
            }]
          }])
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return scope.state.editing;
          },
          'redundantAttribute': 'expr4',
          'selector': '[expr4]',
          'template': _template('<i class="fa fa-ban fa-fw"></i>', [{
            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',
              'evaluate': function evaluate(scope) {
                return scope.viewMode;
              }
            }]
          }])
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return scope.state.editing;
          },
          'redundantAttribute': 'expr5',
          'selector': '[expr5]',
          'template': _template('<i class="fa fa-save fa-fw"></i>', [{
            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',
              'evaluate': function evaluate(scope) {
                return scope.onSave;
              }
            }]
          }])
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return scope.state.editing && scope.state.asTree;
          },
          'redundantAttribute': 'expr6',
          'selector': '[expr6]',
          'template': _template('<i class="fa fa-code fa-fw"></i>', [{
            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',
              'evaluate': function evaluate(scope) {
                return scope.textMode;
              }
            }]
          }])
        }, {
          'type': bindingTypes.IF,
          'evaluate': function evaluate(scope) {
            return scope.state.editing && !scope.state.asTree;
          },
          'redundantAttribute': 'expr7',
          'selector': '[expr7]',
          'template': _template('<i class="fa fa-tree fa-fw"></i>', [{
            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',
              'evaluate': function evaluate(scope) {
                return scope.treeMode;
              }
            }]
          }])
        }]);
      },
      'name': 'rmdevtools'
    };
    return rmdevtools;
  });

  var createStream$2 = createStream$1,
      getStream$1 = getStream,
      getState$1 = getState;
  var connect = Connect;
  var RMDevTools = rmdevtools;
  var index = {
    getState: getState$1,
    createStream: createStream$2,
    getStream: getStream$1,
    connect: connect,
    RMDevTools: RMDevTools
  };

  exports.RMDevTools = RMDevTools;
  exports.connect = connect;
  exports.createStream = createStream$2;
  exports.default = index;
  exports.getState = getState$1;
  exports.getStream = getStream$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
