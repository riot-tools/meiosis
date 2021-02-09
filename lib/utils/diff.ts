import {
    AnyContructor,
    oneIsPrimative,
    hasSameConstructor,
    isSameLength,
} from './helpers';

interface TypeDiffFunc {
    (a: any, b: any): boolean;
}

type MapType = Map<AnyContructor, TypeDiffFunc>;

const typeDiffFunc: MapType = new Map();


typeDiffFunc.set(Array, (a: any, b: any) => {

    // If length changed, they do not match
    if (!isSameLength(a, b)) return true;

    // Filter any values that have changes to relative index
    const changed = a.filter((v: any, i: any): boolean => diff(v, b[i]));

    // If there are filtered values, state has changed
    return changed.length !== 0;
});

typeDiffFunc.set(Object, (a, b) => {

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (!isSameLength( aKeys, bKeys)) return true;

    let hasChange = false;

    for (const key of aKeys) {

        // If hasChange has changed to true, stop looping
        if (hasChange) {
            break;
        }

        // Make sure none of the keys have changed
        hasChange = !bKeys.includes(key);


        const value = a[key];
        const compare = b[key];

        if (oneIsPrimative(value, compare)) {

            hasChange = hasChange || value !== compare;
        }
        else {

            hasChange = hasChange || diff(value, compare);
        }
    }

    return hasChange;
});

typeDiffFunc.set(Map, (a, b) => {

    // If size changed, they do not match
    if (a.size !== b.size) return true;

    // Recursively check if map values have changed
    const changed = [...a.entries()].filter(([k,v]) => (

        // If new map doesnt have key, or the key state has changed
        !b.has(k) || diff(v, b.get(k))
    ));

    // If there are filtered values, state has changed
    return changed.length !== 0;
});

typeDiffFunc.set(Set, (a, b) => {

    // If size changed, they do not match
    if (a.size !== b.size) return true;

    const aVals = [...a.values()];
    const bVals = [...b.values()];

    // Recursively check if set values have changed
    const changed = aVals.filter((v, i) => (

        // If new set doesnt have key, or the key state has changed
        !b.has(v) || diff(v, bVals[i])
    ));

    // If there are filtered values, state has changed
    return changed.length !== 0;
});

typeDiffFunc.set(Date, (a, b) => (

    +a !== +b
));

typeDiffFunc.set(RegExp, (a, b) => (

    (a.source + a.flags) !== (b.source + b.flags)
));

/**
 * Recursively checks if there are changes in the current structure.
 * Returns immediately after detecting a single change.
 * @param change changed item
 * @param current current item
 */
export const diff = (change: any, current: any): boolean => {

    // Primatives don't need contructure checks
    if (oneIsPrimative(change, current)) return change !== current;

    // A change in contructor means it changed
    if (!hasSameConstructor(change, current)) return true;

    // Check if these items are different from one another
    // Each contructor may have a special way of diffing
    const checkIfTypeDifferent = typeDiffFunc.get(current.constructor);

    // Warn about using specific types that are not supported
    if (!checkIfTypeDifferent) {
        console.warn(`Cannot detect changes on ${current.constructor.name} type. It should be avoided in your state.`);
        return false;
    }

    return checkIfTypeDifferent(change, current);
};

export default diff;