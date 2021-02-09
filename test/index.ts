import { clone } from '@riot-tools/state-utils';
import { expect } from 'chai';

import { RiotMeiosis } from '../lib';

console.warn = () => {};

const defer: any = (obj: any = {}) => {

    obj.p = new Promise((rs, rj) => Object.assign(obj, { rs, rj }));

    return obj;
}

const stub: any = {

    wasMounted: () => {},
    wasUnmounted: () => {},
    wasUpdated: () => {},
    wasConnected: () => {},
    state: {
        existingState: true,
        nestedState: {
            hasCandy: true
        }
    },
    props: { prop: true },
    component: {
        state: { something: 'intheway' },
        onBeforeMount: () => stub.wasMounted(),
        onBeforeUnmount: () => stub.wasUnmounted(),
        update: (val) => {

            const retrn = stub.wasUpdated(val);

            if (stub.connected) {

                const { mapToState, connected, props } = stub;
                const { onUpdated, state } = connected;

                // Make connect aware of state changes by faking
                // component lifecycle
                onUpdated({}, mapToState(stub.stream.state(), state, props));
            }

            return retrn;
        }
    },
    mapToState: (appState, state, props) => ({
        ...state,
        ...appState.nestedState,
        props
    }),
    mapToComponentFn: () => ({
        functionWorked: true
    }),
    mapToComponentObj: {
        objectWorked: true
    }
};

describe('Riot Meiosis', function () {

    it('should create an instance', function () {

        const reducer = (newState, oldState) => ({
            ...oldState,
            ...newState
        });

        const meiosis = new RiotMeiosis(stub.state);

        expect(meiosis).to.include.keys('stream', 'connect', 'dispatch');

        Object.assign(stub, meiosis);
    });

    it('should get the current state', function () {

        expect(stub.stream.state()).to.eql(stub.state);
    });


    it('should not connect if state mapper is undefined or bad', function () {

        expect(() => stub.connect()).to.throw(/mapToState must be a function/);
        expect(() => stub.connect({})).to.throw(/mapToState must be a function/);
        expect(() => stub.connect([])).to.throw(/mapToState must be a function/);
    });

    it('should not connect if component mapper is bad', function () {

        const fn = () => {};

        expect(() => stub.connect(fn, 1)).to.throw(/mapToComponent must be a function or object/);
        expect(() => stub.connect(fn, [])).to.throw(/mapToComponent must be a function or object/);
        expect(() => stub.connect(fn, "lol")).to.throw(/mapToComponent must be a function or object/);
    });

    it('should return connect HOF', function () {

        const fn = () => ({})

        // No map to component
        expect(() => stub.connect(fn)).to.not.throw();

        // map to component object
        expect(() => stub.connect(fn, {})).to.not.throw();

        // map to component function
        expect(() => stub.connect(fn, fn)).to.not.throw();
    });

    it('should connect state to component', function () {

        const component = clone(stub.component);
        const connected = stub.connect(stub.mapToState)(component);

        expect(connected.state).to.have.keys('something');
        expect(connected.state).to.not.have.keys('hasCandy');

        let ranOriginal = false;
        stub.wasMounted = () => {

            ranOriginal = true;
        };

        // pretend to mount
        connected.onBeforeMount(stub.props, connected.state);

        expect(ranOriginal).to.be.true;
        expect(connected.state).to.have.keys('hasCandy', 'something', 'props');

        stub.connected = connected;
    });


    it('should update component when push to stream', function () {

        const q = defer();

        let update: any = false;

        stub.wasUpdated = (change) => {
            update = change;
        };

        const runTest = () => {
            try {
                expect(update).to.not.be.false;
                expect(update.shemoves).to.be.true;

                // fake update component state
                stub.connected.state = update;

                q.rs();
            }
            catch (e) {
                q.rj(e);
            }
            stub.stream.removeListener(runTest);
        };

        stub.stream.addListener(runTest);

        stub.dispatch({
            nestedState: {
                ...stub.state.nestedState,
                shemoves: true
            }
        });

        return q.p
    });

    it('should not update component if no changes to state', function () {

        const q = defer();

        let update = false;

        stub.wasUpdated = () => {
            update = true;
        };

        const runTest = () => {
            try {
                expect(update).to.be.false;
                q.rs();
            }
            catch (e) {
                q.rj(e);
            }
            stub.stream.removeListener(runTest);
        };

        stub.stream.addListener(runTest);

        stub.dispatch({
            nestedState: {
                ...stub.state.nestedState
            }
        });

        return q.p
    });

    it('should not update component after unmount', function () {

        const q = defer();

        let update = false;
        let ranOriginal = false;

        stub.wasUpdated = () => { update = true };
        stub.wasUnmounted = () => { ranOriginal = true };


        const runTest = () => {
            try {
                expect(update).to.be.false;
                expect(ranOriginal).to.be.true;
                q.rs();
            }
            catch (e) {
                q.rj(e);
            }
            stub.stream.removeListener(runTest);
        };

        stub.stream.addListener(runTest);

        stub.connected.onBeforeUnmount();

        // trigger a change
        stub.dispatch({
            nestedState: {
                ...stub.state.nestedState,
                shemoves: 50
            }
        });
    });

    it('should map object to component', function () {

        const component = clone(stub.component);

        const actions = {
            pepe: () => 'billete',
            fulanito: () => 'perez'
        };

        const connected = stub.connect(stub.mapToState, actions)(component);

        stub.wasMounted = () => {};

        // pretend to mount
        connected.onBeforeMount(stub.props, connected.state);

        expect(connected).to.include.keys('pepe', 'fulanito');
        expect(connected.pepe()).to.equal(actions.pepe());
        expect(connected.fulanito()).to.equal(actions.fulanito());
    });

    it('should map function to component', function () {

        const component = clone(stub.component);

        let passedState = false;
        let passedProps = false;

        const actions = (props, state) => {

            passedState = !!props;
            passedProps = !!state;

            return {

                pepe: () => 'billete',
                fulanito: () => 'perez'
            };
        };

        const connected = stub.connect(stub.mapToState, actions)(component);

        stub.wasMounted = () => {};

        // pretend to mount
        connected.onBeforeMount(stub.props, connected.state);

        expect(connected).to.include.keys('pepe', 'fulanito');

        expect(passedState).to.be.true;
        expect(passedProps).to.be.true;

        expect(connected.pepe()).to.equal('billete');
        expect(connected.fulanito()).to.equal('perez');
    });

    it('should map state to component when declared in onBeforeMount', function () {

        const component = clone(stub.component);

        const { onBeforeMount } = component;

        component.state = {};

        component.onBeforeMount = (props, state) => {

            component.state = { definedLater: true };
            onBeforeMount.bind(component)(props, state);
        }

        const connected = stub.connect(stub.mapToState)(component);

        expect(connected.state).to.not.have.keys('definedLater');

        // pretend to mount
        connected.onBeforeMount({}, connected.state);
        expect(connected.state).to.include.keys('definedLater');
    });

    it('should not remove stream listener if it has not been initiated', function () {

        const component = clone(stub.component);

        const { onBeforeUnmount } = component;

        component.state = {};

        component.onBeforeUnmount = (props, state) => {

            onBeforeUnmount.bind(component)(props, state);
        }

        expect(() => component.onBeforeUnmount()).to.not.throw();
    });
});