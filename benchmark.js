const diff = require('deep-diff');
const lodashCloneDeep = require('lodash.clonedeep');


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

const objectTypes = [
    Object,
    Array,
    Map,
    Set
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

                // If length changed, they do not match
                if (value.length !== compare.length) return true;

                // Filter any values that have changes to relative index
                const changed = value.filter((v, i) => stateHasChanged(v, compare[i]));

                // If there are filtered values, state has changed
                if (changed.length) return true;
            }

            // Check if map has changed
            if (value.constructor === Map) {

                // If size changed, they do not match
                if (value.size !== compare.size) return true;

                // Recursively check if map values have changed
                const changed = [...value.entries()].filter(([k,v]) => (

                    // If new map doesnt have key, or the key state has changed
                    !compare.has(k) || stateHasChanged(v, compare.get(k))
                ));

                // If there are filtered values, state has changed
                if (changed.length) return true;
            }

            // Check if map has changed
            if (value.constructor === Set) {

                // If size changed, they do not match
                if (value.size !== compare.size) return true;

                // Recursively check if set values have changed
                const changed = [...value.values()].filter((v) => (

                    // If new set doesnt have key, or the key state has changed
                    !compare.has(v) || stateHasChanged(v, compare.get(v))
                ));

                // If there are filtered values, state has changed
                if (changed.length) return true;
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




const deepClone = (original) => {

    if (primitives.includes(original)) {
        return original;
    }

    const _constructor = original.constructor;

    let copy = new _constructor;

    if (_constructor === Object || _constructor === Array) {

        for (const key in original) {

            copy[key] = deepClone(original[key]);
        }
    }

    if (_constructor === Map) {

        const entries = [...original.entries()];

        for (const [key, val] in entries) {

            copy.set(key, deepClone(val));
        }
    }

    if (_constructor === Set) {

        const entries = [...original.values()];

        for (const val in entries) {

            copy.add(deepClone(val));
        }
    }
};




const lorem1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
const lorem2 = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

const t = { lorem1, lorem2 };

const u = { t, u: t, v: t, w: t};

const item1 = {
    a: 1,
    b: 3,
    c: {
        d: true,
        e: {
            f: [{ g: 1 }, { g: 2 }, { g: 1 }, { g: 2 }],
            h: [1,2,3,4],
            i: ['a', true, {}, [true], { id: '12' }]
        },
        j: [lorem1,lorem1,lorem1,lorem1].join(' ')
    },
    l: new Map(Object.entries(u)),
    m: new Set([lorem1, lorem2])
};

const item2 = {
    a: 1,
    b: 3,
    c: {
        d: true,
        e: {
            f: [{ g: 1 }, { g: 2 }, { g: 3 }, { g: 4 }],
            h: [1,3,4,2],
            i: ['a', {}, [true], { id: '12' }]
        },
        j: [lorem1,lorem1,lorem1,lorem2].join(' ')
    },
    k: [lorem1,lorem1,lorem2,lorem2].join(' '),
    l: new Map(Object.entries(u)),
    m: new Set([lorem1, lorem2, t])
};

const benchmark = (fn, times) => {

    while (times) {
        fn();
        times--;
    }
};

const numOfCycles = 1000 * 1000;



console.time('deepClone');
benchmark(() => (
    deepClone(item2)
), numOfCycles);
console.timeEnd('deepClone');

console.time('lodashCloneDeep');
benchmark(() => (
    lodashCloneDeep(item2)
), numOfCycles);
console.timeEnd('lodashCloneDeep');


console.time('stateHasChanged');
benchmark(() => stateHasChanged(item1, item2), numOfCycles);
console.timeEnd('stateHasChanged');



console.time('deep-diff');
benchmark(() => diff(item1, item2), numOfCycles);
console.timeEnd('deep-diff');



console.time('stringify');
benchmark(() => (
    JSON.stringify(item1) == JSON.stringify(item2)
), numOfCycles);
console.timeEnd('stringify');