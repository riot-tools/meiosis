import * as StateUtils from '@riot-tools/state-utils';

export const isFunctionOrObject = (a: Function | Object): boolean => (
    a.constructor === Function ||
    a.constructor === Object
);

export const isUndefined = (val: any) => val === undefined;

export const assertFunction = (msg: String, func: Function) => {

    if (typeof func !== 'function') {

        throw TypeError(`${msg} must be a function`);
    }
};

export const definePrivateProperties = (target: object, props: object) => {

    Object.entries(props).map(([prop, value]) => {

        Object.defineProperty(
            target,
            prop,
            {
                value,
                writable: false,
                enumerable: false
            }
        );
    });
};

export const definePrivateGetters = (target: object, props: object) => {

    Object.entries(props).map(([prop, getter]) => {

        Object.defineProperty(
            target,
            prop,
            {
                get: getter,
                writable: false,
                enumerable: false
            }
        );
    });
};

export const deepFreeze = (target: object) => {

    if (StateUtils.isNonIterable(target)) {
        return;
    }

    Object.freeze(target);

    for (const key in target) {

        deepFreeze(target[key]);
    }
};

export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

export default {};