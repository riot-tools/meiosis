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
});