import { expect } from 'chai';
import { RiotMeiosis } from '../lib';

const stub: any = {

};

describe('State Manager', function () {

    it('has functions to manage state, modifiers and listeners', () => {

        const store = new RiotMeiosis({});
        expect(store.stream.addReducer).to.be.an.instanceof(Function);
        expect(store.stream.removeReducer).to.be.an.instanceof(Function);

        expect(store.stream.addListener).to.be.an.instanceof(Function);
        expect(store.stream.removeListener).to.be.an.instanceof(Function);

        expect(store.stream.states).to.be.an.instanceof(Function);

    });

    it('returns array of states', () => {

        const { stream } = new RiotMeiosis({});

        const states = stream.states();
        expect(states.constructor).to.eq(Array);
    });

    it('returns current state', () => {

        const { stream } = new RiotMeiosis({});

        const state = stream.state();
        expect(state.constructor).to.eq(Object);
    });

    it('sets empty object as default state', () => {

        const { stream } = new RiotMeiosis({});

        const state = stream.state();
        expect(Object.keys(state)).to.have.length(0);
    });

    it('sets passed state in state holder', () => {

        const check = { test: true };

        const { stream } = new RiotMeiosis(check);
        const state = stream.state();

        expect(state).to.eql(check)
    });

    it('listens for changes', () => {

        const start = { oy: true };
        const { stream } = new RiotMeiosis(start);

        stub.reducer = (next, prev) => ({
            ...prev,
            ...next
        });

        stub.listener = (next, prev) => {

            stub.next = next;
            stub.prev = prev;
        };

        stream.addReducer(stub.reducer);

        stream.addListener(stub.listener);

        const check = { blyot: true };
        stream.dispatch(check);

        expect(stub.next).to.eql({
            oy: true,
            blyot: true
        });

        expect(stub.prev).to.eql(start);
    });

    it('removes listener', () => {

        const start = { oy: true };
        const { stream } = new RiotMeiosis(start);

        stream.addListener(stub.listener);

        stub.next = null;
        stub.prev = null;

        stream.removeListener(stub.listener);
        stream.dispatch({ pepe: true });

        expect(stub).to.include({ next: null, prev: null });
    });

    it('adds a reducer', () => {

        const { stream } = new RiotMeiosis({});

        expect(stream._reducers.size).to.eq(0);

        stub.reducer = (state) => {

            state.updated = true;
            return state;
        };

        stream.addReducer(stub.reducer);
        expect(stream._reducers.size).to.eq(1);
    });

    it('modifies a new state', () => {

        const { stream } = new RiotMeiosis({});
        stream.addReducer(stub.reducer);

        expect((stream.state() as any).updated).to.eq(undefined);

        stream.dispatch({ updated: false });

        expect((stream.state() as any).updated).to.eq(true);

    });

    it('removes a reducer', () => {

        stub.store = new RiotMeiosis({});
        const { stream } = stub.store;

        const reducer = (state) => {

            state.updated = true;
            return state;
        };

        stream.addReducer(reducer);
        expect(stream._reducers.size).to.eq(1);
        stream.removeReducer(reducer);

        stream.dispatch({ updated: false });

        expect(stream._reducers.size).to.eq(0);
        expect(stream.state().updated).to.eq(false);
    });

    it('makes current state the passed value if no modifiers exist', () => {

        const check = { blyat: true };
        stub.store.stream.dispatch(check);
        const state = stub.store.stream.state();

        expect(state).to.eql(check)
    });

    it('does not update state if reducer returns ignore', () => {

        const { stream } = new RiotMeiosis({ oy: true, shouldIgnore: true });

        const modifier1 = function (next, prev, ignore) {


            if (next.shouldIgnore) {

                return ignore;
            }

            next.didUpdate = true;

            return {
                ...prev,
                ...next
            };
        };

        const modifier2 = (n, o) => ({
            ...n,
            ...o,
            otherModifier: true
        });

        stream.addReducer(modifier1);
        stream.addReducer(modifier2);

        stream.dispatch({ blyot: true, shouldIgnore: true });

        const state = stream.state();


        expect(state).to.have.keys([
            'otherModifier',
            'blyot',
            'oy',
            'shouldIgnore'
        ]);

        expect(state).to.not.have.key('didUpate');
    });

    it('keeps only a specified number of states', () => {

        const { stream } = new RiotMeiosis({}, {

            statesToKeep: 3
        });

        stream.dispatch({ a: 1 });
        stream.dispatch({ a: 2 });
        stream.dispatch({ a: 3 });
        stream.dispatch({ a: 4 });
        stream.dispatch({ a: 5 });

        expect(stream.states()).to.have.length(3);
    });


    it('removes states after they have been dispatched to listeners', () => {

        const { stream } = new RiotMeiosis({}, {

            flushOnRead: true
        });

        stream.dispatch({ a: 1 });
        stream.dispatch({ a: 2 });

        const beforeListeners = stream.states().length;

        stream.addListener(() => {});

        stream.dispatch({ a: 3 });
        stream.dispatch({ a: 4 });
        stream.dispatch({ a: 5 });

        const afterListeners = stream.states().length;

        expect({
            beforeListeners,
            afterListeners
        }).to.eql({
            beforeListeners: 3,
            afterListeners: 1
        });
    });

    it('goes backward in state', () => {

        stub.store = new RiotMeiosis({}, {

            statesToKeep: 10
        });

        stub.store.stream.dispatch({ a: 1 });
        stub.store.stream.dispatch({ a: 2 });
        stub.store.stream.dispatch({ a: 3 });
        stub.store.stream.dispatch({ a: 4 });
        stub.store.stream.dispatch({ a: 5 });

        const current = stub.store.stream.state();

        stub.store.stream.prevState();

        const actual = stub.store.stream.state();

        expect([current.a, actual.a]).to.eql([5, 4]);
    });


    it('goes forward in state', () => {

        const current = stub.store.stream.state();

        stub.store.stream.prevState();
        stub.store.stream.prevState();
        stub.store.stream.nextState();

        const actual = stub.store.stream.state();

        expect([current.a, actual.a]).to.eql([4, 3]);
    });


    it('resets to current state', () => {

        const current = stub.store.stream.state();

        stub.store.stream.prevState();
        stub.store.stream.prevState();
        stub.store.stream.resetState();

        const actual = stub.store.stream.state();

        expect([current.a, actual.a]).to.eql([3, 5]);
    });

    it('creates a clone of stream that has a one way data flow from parent to child', () => {

        const { stream } = new RiotMeiosis({ a: 0 });

        stub.parentListener = 0;
        stub.parentModifier = 0;

        stream.addListener(() => {
            stub.parentListener++;
        });

        stream.addReducer((n, o) => {
            stub.parentModifier++;
            return { ...o, ...n };
        });

        stream.dispatch ({ a: 1 });

        const parent1stState = stream.state();
        const clone = stream.clone();
        const clone1stSate = clone.state();

        clone.dispatch({ a: 2 });

        const parent2ndState = stream.state();
        const clone2ndState = clone.state();

        stream.dispatch ({ a: 3 });

        const parent3rdState = stream.state();
        const clone3rdState = clone.state();

        expect(parent1stState.a).to.equal(1);
        expect(clone1stSate.a).to.equal(1);
        expect(parent2ndState.a).to.equal(1);
        expect(clone2ndState.a).to.equal(2);
        expect(parent3rdState.a).to.equal(3);
        expect(clone3rdState.a).to.equal(3);
        expect(stub.parentListener).to.equal(2);
        expect(stub.parentModifier).to.equal(4);
    });

    it('creates a clone with bidirectional data flow', () => {

        const { stream } = new RiotMeiosis({ a: 0 });

        stub.parentListener = 0;
        stub.reducer = 0;

        stream.addListener(() => {
            stub.parentListener++;
        });

        stream.addReducer((n, o) => {
            stub.reducer++;
            return { ...o, ...n };
        });

        const clone = stream.clone({ bidirectional: true });

        expect(stream.states()).to.have.length(1);
        expect(clone.states()).to.have.length(1);

        stream.dispatch({ parent: true });

        expect(stream.states()).to.have.length(2);
        expect(clone.states()).to.have.length(2);

        clone.dispatch({ child: true });

        expect(stream.states()).to.have.length(3);
        expect(clone.states()).to.have.length(3);

        expect(stub.reducer).to.equal(4);

        expect(clone.state()).to.include.keys('parent', 'child');
        expect(stream.state()).to.include.keys('parent', 'child');

    });

});
