import { expect } from 'chai';
import * as fc from 'fast-check';

import { diff, clone } from '..';

const stub = {

    sameSymbol: Symbol(),

    crap: () => ({
        arr: [{x:1}, {y:2}],
        obj: { z: true },
        str: 'abc',
        num: 123,
        bool: true,
        map: new Map([['a', 1], [1, 'a']]),
        set: new Set(['a', 1])
    }),

    complex: (beer) => ({
        isOpen: true,
        editingMode: false,
        editorOpts: {
            mode: "view",
            mainMenuBar: false
        },
        app: {
            authenticated: false,
            isMobile: false,
            loading: true
        },
        beep: [{
            bop: true,
            beer: [
                { german: [beer]}
            ]
        }]
    }),

    simple: () => ({

        str: 'abc',
        num: 123,
        bool: true,
        nil: null,
        undef: undefined
    })
}


describe('Utilities - Diff - Arguments', function () {

    it('should diff any kind of value', function () {

        const predicate = (a,b) => {
            diff(a,b)
        };

        fc.assert(
            fc.property(
                fc.anything(),
                fc.anything(),
                predicate
            ),
            { numRuns: 10000 }
        );

        fc.assert(
            fc.property(
                fc.anything(),
                fc.date(),
                predicate
            )
        );

        diff(null, null);
        diff(undefined, undefined);
        diff(true, true);
        diff(new Date(), new Date());
        diff(new RegExp('test'), new RegExp('tets'));

        const iterables = [
            Int8Array,
            Uint8Array,
            Uint8ClampedArray,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array
        ];

        iterables.forEach(Klass => (
            diff(
                new Klass([21, 32]),
                new Klass([22, 43]),
            )
        ));

    }).timeout(10 * 1000);

    it('should have changes no matter the primitive', function () {

        const state1 = { x: 1 };

        [
            'string',
            true,
            0,
            null,
            undefined,
            Symbol('lol'),
            new Map(),
            new Set(),
            [],
            {},
            new Date(),
            new RegExp('lol')
        ].forEach(x => {

            const changed = diff(state1, { x });
            expect(changed).to.be.true;
        })
    });

    it('should not throw if there is no change and values are undefined or null', function () {

        const hasNull = { x: null };
        const hasUndefined = { x: undefined };

        expect(() => diff(hasNull, { ...hasNull })).to.not.throw();
        expect(() => diff(hasUndefined, { ...hasUndefined })).to.not.throw();
    });

    it('should not error on undiffable types', () => {

        expect(() => diff(new Function, new WeakMap)).to.not.throw();
        expect(() => diff(new WeakSet, new Promise(() => {}))).to.not.throw();
    });
});

describe('Utilities - Diff - Objects and Arrays', function () {

    it('should be true if number of object keys are different', function () {

        const state1 = { x: 1 };
        const state2 = { x: 1, y: 1 };

        const changed = diff(state1, state2);
        expect(changed).to.be.true;
    });

    it('should be true if missing a key', function () {

        const state1 = { x: 1, z: 1 };
        const state2 = { x: 1, y: 1 };

        const changed = diff(state1, state2);
        expect(changed).to.be.true;
    });

    it('should be true if value is primitive and changes', function () {

        const state1 = { x: 1, y: 1 };
        const state2 = { x: 1, y: 2 };

        const changed = diff(state1, state2);
        expect(changed).to.be.true;
    });


    it('should be true on complex structures', function () {

        const state1 = stub.complex('becks')
        const state2 = stub.complex('pauli girl');

        expect(
            diff(state1, state2)
        ).to.be.true;

    });

    it('should be true on very deep nested', function () {

        const x = 'super';

        const state1 = { x: { x: { x: { x }}}}
        const state2 = { x: { x: { x: { x: `${x}s` }}}}

        const changed = diff(state1, state2);
        expect(changed).to.be.true;
    });

    it('should implement recursion', function () {

        const state1 = stub.crap();
        const state2 = stub.crap();

        state2.obj = { y: true };

        const changed = diff(state1, state2);

        expect(changed).to.be.true;
    });

    it('should diff mismatching arrays', () => {

        const hasDiff = [
            [ [1,2,3], [2,1,3] ],
            [ [{ X: true }, 2, 3], [{ x: true }, 1, 3] ],
            [ [{ x: false }, 2, 3], [{ x: true }, 1, 3] ],
            [ [{x:1}, {y:2}], [{y:2}, {x:1}] ]
        ];

        for (const [a,b] of hasDiff) {
            expect(diff(a, b)).to.be.true;
        }
    });

    it('should not diff matching arrays', () => {

        const n = [1,2,3];
        const b = [true, false];
        const u = [undefined, null];
        const c = [stub.crap(), stub.crap()];
        const hasDiff = [
            [[...n], [...n]],
            [[...b], [...b]],
            [[...u], [...u]],
            [[...c], [...c]],
        ];

        for (const [a,b] of hasDiff) {
            expect(diff(a, b)).to.be.false;
        }
    });

});


describe('Utilities - Diff - Maps and Sets', function () {

    it('should diff mismatching maps', () => {

        const e1 = new Map(Object.entries(stub.crap()));
        const e2 = new Map(Object.entries(stub.complex()));

        expect(diff(e1, e2)).to.be.true;
    });

    it('should not diff matching maps', () => {

        const e1 = new Map(Object.entries(stub.complex()));
        const e2 = new Map(Object.entries(stub.complex()));

        expect(diff(e1, e2)).to.be.false;
    });

    it('should diff mismatching sets', () => {

        const e1 = new Set(Object.values(stub.simple()));
        const e2 = new Set(Object.values(stub.simple()));
        const e3 = new Set(Object.values(stub.simple()));

        e2.add('x');
        e3.add('x');
        e3.delete(null);

        expect(diff(e1, e2)).to.be.true;
        expect(diff(e1, e3)).to.be.true;
        expect(diff(e2, e3)).to.be.true;
    });

    it('should not diff matching sets', () => {

        const e1 = new Set(Object.values(stub.simple()));
        const e2 = new Set(Object.values(stub.simple()));

        expect(diff(e1, e2)).to.be.false;
    });

});


describe('Utilities - Diff - Miscellaneous Types', function () {

    it('should diff mismatching regex', () => {

        const rgx = '^abc123{2,}[a-z]\\d+.+\\s(a|b)';
        const r1 = new RegExp(rgx, 'i');
        const r2 = new RegExp(rgx, 'im');
        const r3 = new RegExp(rgx + '$', 'im');

        expect(diff(r1, r2)).to.be.true;
        expect(diff(r1, r3)).to.be.true;
        expect(diff(r2, r3)).to.be.true;
    });

    it('should not diff matching regex', () => {

        const rgx = '^abc123{2,}[a-z]\\d+.+\\s(a|b)';
        const r1 = new RegExp(rgx, 'i');
        const r2 = new RegExp(rgx, 'i');

        expect(diff(r1, r2)).to.be.false;
    });

    it('should diff mismatching dates', () => {

        const d = new Date();
        const d1 = new Date(+d);
        const d2 = new Date(+d + 1);

        expect(diff(d1, d2)).to.be.true;
    });
    it('should not diff matching dates', () => {

        const d = new Date();
        const d1 = new Date(+d);
        const d2 = new Date(+d);

        expect(diff(d1, d2)).to.be.false;
    });

});