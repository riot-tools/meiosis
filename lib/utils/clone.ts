import {
    AnyContructor,
    isPrimitive
} from './helpers';

interface TypeCloneFunc {
    (a: any): any;
}

type MapType = Map<AnyContructor, TypeCloneFunc>;

const typeCloneFunc: MapType = new Map();

typeCloneFunc.set(Array, (a) => a.map((v: any) => clone(v)));


typeCloneFunc.set(Object, (a: Object) => {

    const copy: object = new Object;

    let key: keyof Object;
    for (key in a) {

        copy[key] = clone(a[key]);
    }

    return copy;
});

typeCloneFunc.set(Map, (a: Map<any, any>) => {

    const copy = new Map;

    for (const entry in [...a.entries()]) {

        const [key, val] = entry;
        copy.set(key, clone(val));
    }

    return copy;
});

typeCloneFunc.set(Set, (a) => {

    const copy = new Set;

    for (const original in [...a.values()]) {

        const cloned = clone(original);
        copy.add(cloned);
    }

    return copy;
});


export const clone = (original: any): any => {

    // Primatives do not have issues with hoisting
    if (isPrimitive(original)) {
        return original;
    }

    const cloneType = typeCloneFunc.get(original.constructor);

    // Warn about using specific types that are not supported
    if (!cloneType) {
        console.warn(`Cannot clone ${original.constructor.name} type. It should be avoided in your state.`);
        return original;
    }

    return cloneType(original);
};


export default clone;
