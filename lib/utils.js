export const arrayMatches = (arr1, arr2) => {

    if (arr1.length !== arr2.length) {

        return false;
    }

    for (const item of arr1) {
        if (!arr2.includes(item)) {
            return false
        };
    }

    return true;
};

const primitives = [
    String,
    Number,
    Boolean,
    BigInt,
    Symbol,
    null,
    undefined
];

export const stateHasChanged = (change, current) => {

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

            // If value constructor changes
            if (value.constructor !== compare.constructor) {

                return true;
            }

            // Check that array does not match
            if (value.constructor === Array) {

                return !arrayMatches(value, compare);
            }

            // Recurse if value is an object
            if (typeof value === 'object') {

                return stateHasChanged(value, compare);
            }
        }
        else {
            return true;
        }
    }
};
