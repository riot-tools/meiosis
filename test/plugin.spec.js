import { expect } from 'chai';

import Manager from '../lib/manager';
import Plugin from '../lib/plugin';

const stub = {
    wasUnmounted: () => {},
    wasUpdated: () => {},
    wasConnected: () => {},
    state: {
        existingState: true,
        nestedState: {
            hasCandy: true
        }
    },
    component: {

        onUnmounted: () => stub.wasUnmounted(),
        update: (val) => stub.wasUpdated(val),
        connect: (...args) => stub.wasConnected(...args)
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

    it('should not bind state if connect is not defined', function () {

        const component = { ...stub.component };

        delete component.connect;

        expect(component).to.not.include.keys(
            'getState',
            'stream',
            'mainStream'
        );

        stub.plugin(component);

        expect(component).to.not.include.keys(
            'getState',
            'stream',
            'mainStream'
        );
    });

    it('should bind state if connect is passed', function () {

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

    it('should copy initial state into component state', function () {

        const component = { ...stub.component };

        stub.wasConnected = (appState, state) => ({
            ...state,
            ...appState
        });

        stub.plugin(component);

        expect(component.state).to.include.keys(...Object.keys(stub.manager.getState()));
        expect(component.state.existingState).to.eq(true);
    });

    it('should copy a section of state into component state', function () {

        const component = { ...stub.component };

        stub.wasConnected = (appState, state) => ({
            ...state,
            ...appState.nestedState
        });

        stub.plugin(component);

        const { nestedState } = stub.manager.getState()

        expect(component.state).to.include.keys(...Object.keys(nestedState));
        expect(component.state.hasCandy).to.eq(true);
    });

    it('should update component on stream push', async () => {

        stub.plugin(stub.component);

        let updatedState = false;
        const update = { success: true };
        stub.wasUpdated = (newState) => {

            updatedState = true;
        }

        await stub.component.stream.push(update);
        expect(updatedState).to.eq(false);

    });

    it('should not update if state has not changed', async () => {

        stub.wasConnected = (appState, state) => ({
            ...state,
            ...appState
        });

        stub.plugin(stub.component);

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