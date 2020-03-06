import { expect } from 'chai';

import { arrayMatches, stateHasChanged } from '../lib/utils';


describe('Utility functions', function () {

    it('should fail array match if length is different', function () {

        const arr1 = [1,2,3];
        const arr2 = [1,2];

        const matches = arrayMatches(arr1, arr2);
        expect(matches).to.be.false;
    });

    it('should fail array match if values are different', function () {

        const arr1 = [1,2,3];
        const arr2 = [1,2,4];

        const matches = arrayMatches(arr1, arr2);
        expect(matches).to.be.false;
    });

    it('should array match if values are the same', function () {

        const arr1 = [1,2,3];
        const arr2 = [1,2,3];

        const matches = arrayMatches(arr1, arr2);
        expect(matches).to.be.true;
    });

    it('should have changes if number of object keys are different', function () {

        const state1 = { x: 1 };
        const state2 = { x: 1, y: 1 };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;
    });

    it('should have changes if missing a key', function () {

        const state1 = { x: 1, z: 1 };
        const state2 = { x: 1, y: 1 };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;
    });

    it('should have changes if value is primitive and changes', function () {

        const state1 = { x: 1, y: 1 };
        const state2 = { x: 1, y: 2 };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;
    });

    it('should have changes no matter the primitive', function () {

        const state1 = { x: 1 };

        [
            'string',
            true,
            0,
            null,
            undefined,
            Symbol('lol')
        ].forEach(x => {

            const changed = stateHasChanged(state1, { x });
            expect(changed).to.be.true;
        })
    });

    it('should have changes on complex structures', function () {

        const state1 = {
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
                    { german: ['becks']}
                ]
            }]
        };

        const state2 = {
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
                    { german: ['pauli girl']}
                ]
            }]
        };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;

    });

    it('should have changes on very deep nested', function () {

        const state1 = {
            isOpen: true,
            nested: {
                nested: {
                    nested: {
                        super: 'duper'
                    }
                }
            },
            more: {
                more: {
                    more: {
                        more: {
                            more: {
                                super: 'duper'
                            }
                        }
                    }
                }
            }
        };

        const state2 = {
            isOpen: true,
            nested: {
                nested: {
                    nested: {
                        super: 'duper'
                    }
                }
            },
            more: {
                more: {
                    more: {
                        more: {
                            more: {
                                super: 'duperz'
                            }
                        }
                    }
                }
            }
        };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;

    });

    it('should have changes if value is not primitive and prototype changes', function () {

        const state1 = { x: 1, y: {} };
        const state2 = { x: 1, y: [] };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;
    });

    it('should have changes if value is array and changes', function () {

        const state1 = { x: 1, y: [] };
        const state2 = { x: 1, y: [1] };

        const changed = stateHasChanged(state1, state2);
        expect(changed).to.be.true;
    });

    it('should check for changes recursively', function () {

        const subState = {

            nested: true
        };

        const subState2 = { ...subState };

        subState.arr = [];
        subState2.arr = [1];

        const state1 = { x: 1, y: { test: subState } };
        const state2 = { x: 1, y: { test: subState2 } };

        const changed = stateHasChanged(state1, state2);

        expect(changed).to.be.true;
    });

    it('should not throw if there is no change and values are undefined or null', function () {

        const hasNull = { x: null };
        const hasUndefined = { x: undefined };

        expect(() => stateHasChanged(hasNull, { ...hasNull })).to.not.throw();
        expect(() => stateHasChanged(hasUndefined, { ...hasUndefined })).to.not.throw();
    });
});