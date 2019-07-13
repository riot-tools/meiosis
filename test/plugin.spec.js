import { expect } from 'chai';

import Manager from '../lib/manager';
import Plugin from '../lib/plugin';

const stub = {
    wasUnmounted: () => {},
    wasUpdated: () => {},
    state: {
        existingState: true
    },
    component: {

        onUnmounted: () => stub.wasUnmounted(),
        update: (val) => stub.wasUpdated(val)
    }
};

describe('Riot state plugin', function () {

    it('should create an API for managing state', function () {

        stub.manager = Manager(stub.state);
        expect(stub.manager).to.include.keys(
            'getState',
            'mergeState',
            'stream',
            'cloneStream'
        );
    });

    it('should accept manager as argument and return plugin function', function () {

        stub.plugin = Plugin(stub.manager);
        expect(stub.plugin).to.be.a('function');
    });

    it('should bind state related functionality to component', function () {

        expect(stub.component).to.not.include.keys(
            'getState',
            'stream',
            'mainStream'
        )
        stub.plugin(stub.component);
        expect(stub.component).to.include.keys(
            'getState',
            'stream',
            'mainStream'
        )
    });

    it('should have a clone of main stream', function () {

        expect(stub.component.stream).to.not.equal(stub.component.mainStream);

        const children = Array.from(stub.component.mainStream.children);
        expect(stub.component.stream).to.equal(children[0]);
    });

    it('should have copied initial state into component state', function () {

        expect(stub.component.state).to.include.keys(...Object.keys(stub.manager.getState()));
        expect(stub.component.state.existingState).to.eq(true);
    });

    it('should update component on stream push', async () => {

        let updatedState = false;
        const update = { success: true };
        stub.wasUpdated = (newState) => {


            expect(newState).to.include.keys('success');
            expect(newState.success).to.eq(true);

            updatedState = true;
        }

        await stub.component.stream.push(update);
        expect(updatedState).to.eq(true);

    });

    it('should end stream on unmount', function () {

        let ranOriginal = false;
        let streamEnd = false;

        stub.component.stream.on.end(() => streamEnd = true);

        stub.wasUnmounted = () => ranOriginal = true;

        stub.component.onUnmounted();

        expect(ranOriginal).to.eq(true);
        expect(streamEnd).to.eq(true);
    });
});