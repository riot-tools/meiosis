import { expect } from 'chai';

import {
    connect,
    getState,
    createStream,
    getStream
} from '../lib';

const clone = (obj) => {

    const newObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            newObj[key] = clone(obj[key]);
        }
        else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};

const defer = (obj = {}) => {

    obj.p = new Promise((rs, rj) => Object.assign(obj, { rs, rj }));

    return obj;
}

const stub = {

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
                onUpdated({}, mapToState(getState(), state, props));
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

    it('should not create a stream without a reducer', function () {

        expect(() => createStream()).to.throw(/reducer must be a function/);
    });

    it('should not create a stream without an initial state', function () {

        expect(() => createStream(() => {})).to.throw(/initial state cannot be undefined or null/);
        expect(() => createStream(() => {}, null)).to.throw(/initial state cannot be undefined or null/);
    });

    it('should create a stream', function () {

        const reducer = (newState, oldState) => ({
            ...oldState,
            ...newState
        });

        const stream = createStream(reducer, stub.state);

        expect(stream).to.include.keys('on', 'off', 'connect', 'push', 'end', 'fork', 'next');

        stub.stream = stream;
    });

    it('should get the current state', function () {

        expect(getState()).to.eql(stub.state);
    });

    it('should get the current stream', function () {

        expect(getStream()).to.eq(stub.stream);
    });


    it('should not connect if state mapper is undefined or bad', function () {

        expect(() => connect()).to.throw(/mapToState must be a function/);
        expect(() => connect({})).to.throw(/mapToState must be a function/);
        expect(() => connect([])).to.throw(/mapToState must be a function/);
    });

    it('should not connect if component mapper is undefined or bad', function () {

        const fn = () => {}
        expect(() => connect(fn, 1)).to.throw(/mapToComponent must be a function or object/);
        expect(() => connect(fn, [])).to.throw(/mapToComponent must be a function or object/);
        expect(() => connect(fn, "lol")).to.throw(/mapToComponent must be a function or object/);
    });

    it('should return connect HOF', function () {

        const fn = () => ({})

        // No map to component
        expect(() => connect(fn)).to.not.throw();

        // map to component object
        expect(() => connect(fn, {})).to.not.throw();

        // map to component function
        expect(() => connect(fn, fn)).to.not.throw();
    });

    it('should connect state to component', function () {

        const component = clone(stub.component);
        const connected = connect(stub.mapToState)(component);

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

        let update = false;

        stub.wasUpdated = (change) => {
            update = change;
        };

        const stream = getStream();

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
            stream.off.value(runTest);
        };

        stream.on.value(runTest);

        stream.push({
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

        stub.wasUpdated = (val) => {
            update = true;
        };

        const stream = getStream();

        const runTest = () => {
            try {
                expect(update).to.be.false;
                q.rs();
            }
            catch (e) {
                q.rj(e);
            }
            stream.off.value(runTest);
        };

        stream.on.value(runTest);

        stream.push({
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

        const stream = getStream();

        const runTest = () => {
            try {
                expect(update).to.be.false;
                expect(ranOriginal).to.be.true;
                q.rs();
            }
            catch (e) {
                q.rj(e);
            }
            stream.off.value(runTest);
        };

        stream.on.value(runTest);

        stub.connected.onBeforeUnmount();

        // trigger a change
        stream.push({
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

        const connected = connect(stub.mapToState, actions)(component);

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

        const connected = connect(stub.mapToState, actions)(component);

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

        const connected = connect(stub.mapToState)(component);

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