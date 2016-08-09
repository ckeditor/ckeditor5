/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EmitterMixin from '/ckeditor5/utils/emittermixin.js';
import EventInfo from '/ckeditor5/utils/eventinfo.js';

let emitter, listener;

beforeEach( refreshEmitter );

describe( 'fire', () => {
	it( 'should execute callbacks in the right order without priority', () => {
		let spy1 = sinon.spy().named( 1 );
		let spy2 = sinon.spy().named( 2 );
		let spy3 = sinon.spy().named( 3 );

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );

		sinon.assert.callOrder( spy1, spy2, spy3 );
	} );

	it( 'should execute callbacks in the right order with priority defined', () => {
		let spy1 = sinon.spy().named( 1 );
		let spy2 = sinon.spy().named( 2 );
		let spy3 = sinon.spy().named( 3 );
		let spy4 = sinon.spy().named( 4 );
		let spy5 = sinon.spy().named( 5 );

		emitter.on( 'test', spy2, 'high' );
		emitter.on( 'test', spy3 ); // Defaults to 'normal'.
		emitter.on( 'test', spy4, 'low' );
		emitter.on( 'test', spy1, 'highest' );
		emitter.on( 'test', spy5, 'lowest' );

		emitter.fire( 'test' );

		sinon.assert.callOrder( spy1, spy2, spy3, spy4, spy5 );
	} );

	it( 'should pass arguments to callbacks', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );

		emitter.fire( 'test', 1, 'b', true );

		sinon.assert.calledWithExactly( spy1, sinon.match.instanceOf( EventInfo ), 1, 'b', true );
		sinon.assert.calledWithExactly( spy2, sinon.match.instanceOf( EventInfo ), 1, 'b', true );
	} );

	it( 'should pass proper context to callbacks', () => {
		let ctx1 = {};
		let ctx2 = {};

		let spy1 = sinon.spy();
		let spy2 = sinon.spy();
		let spy3 = sinon.spy();

		emitter.on( 'test', spy1, 'normal', ctx1 );
		emitter.on( 'test', spy2, 'normal', ctx2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );

		sinon.assert.calledOn( spy1, ctx1 );
		sinon.assert.calledOn( spy2, ctx2 );
		sinon.assert.calledOn( spy3, emitter );
	} );

	it( 'should fire the right event', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();

		emitter.on( '1', spy1 );
		emitter.on( '2', spy2 );

		emitter.fire( '2' );

		sinon.assert.notCalled( spy1 );
		sinon.assert.called( spy2 );
	} );

	it( 'should execute callbacks many times', () => {
		let spy = sinon.spy();

		emitter.on( 'test', spy );

		emitter.fire( 'test' );
		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledThrice( spy );
	} );

	it( 'should do nothing for a non listened event', () => {
		emitter.fire( 'test' );
	} );

	it( 'should accept the same callback many times', () => {
		let spy = sinon.spy();

		emitter.on( 'test', spy );
		emitter.on( 'test', spy );
		emitter.on( 'test', spy );

		emitter.fire( 'test' );

		sinon.assert.calledThrice( spy );
	} );

	it( 'should not fire callbacks for an event that were added while firing that event', () => {
		let spy = sinon.spy();

		emitter.on( 'test', () => {
			emitter.on( 'test', spy );
		} );

		emitter.fire( 'test' );

		sinon.assert.notCalled( spy );
	} );

	it( 'should correctly fire callbacks for namespaced events', () => {
		let spyFoo = sinon.spy();
		let spyBar = sinon.spy();
		let spyAbc = sinon.spy();
		let spyFoo2 = sinon.spy();

		// Mess up with callbacks order to check whether they are called in adding order.
		emitter.on( 'foo', spyFoo );
		emitter.on( 'foo:bar:abc', spyAbc );
		emitter.on( 'foo:bar', spyBar );

		// This tests whether generic callbacks are also added to specific callbacks lists.
		emitter.on( 'foo', spyFoo2 );

		// All four callbacks should be fired.
		emitter.fire( 'foo:bar:abc' );

		sinon.assert.callOrder( spyFoo, spyAbc, spyBar, spyFoo2 );
		sinon.assert.calledOnce( spyFoo );
		sinon.assert.calledOnce( spyAbc );
		sinon.assert.calledOnce( spyBar );
		sinon.assert.calledOnce( spyFoo2 );

		// Only callbacks for foo and foo:bar event should be called.
		emitter.fire( 'foo:bar' );

		sinon.assert.calledOnce( spyAbc );
		sinon.assert.calledTwice( spyFoo );
		sinon.assert.calledTwice( spyBar );
		sinon.assert.calledTwice( spyFoo2 );

		// Only callback for foo should be called as foo:abc has not been registered.
		// Still, foo is a valid, existing namespace.
		emitter.fire( 'foo:abc' );

		sinon.assert.calledOnce( spyAbc );
		sinon.assert.calledTwice( spyBar );
		sinon.assert.calledThrice( spyFoo );
		sinon.assert.calledThrice( spyFoo2 );
	} );
} );

describe( 'on', () => {
	it( 'should stop()', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();
		let spy3 = sinon.spy( ( event ) => {
			event.stop();
		} );

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy3 );
		emitter.on( 'test', sinon.stub().throws() );
		emitter.on( 'test', sinon.stub().throws() );

		emitter.fire( 'test' );

		sinon.assert.called( spy1 );
		sinon.assert.called( spy2 );
		sinon.assert.called( spy3 );
	} );

	it( 'should take a callback off()', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy( ( event ) => {
			event.off();
		} );
		let spy3 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledTwice( spy1 );
		sinon.assert.calledOnce( spy2 );
		sinon.assert.calledTwice( spy3 );
	} );

	it( 'should take the callback off() even after stop()', () => {
		let spy1 = sinon.spy( ( event ) => {
			event.stop();
			event.off();
		} );
		let spy2 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledOnce( spy2 );
	} );
} );

describe( 'once', () => {
	it( 'should be called just once', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();
		let spy3 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.once( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledTwice( spy1 );
		sinon.assert.calledOnce( spy2 );
		sinon.assert.calledTwice( spy3 );
	} );

	it( 'should have proper scope', () => {
		let ctx = {};

		let spy1 = sinon.spy();
		let spy2 = sinon.spy();

		emitter.once( 'test', spy1, 'normal', ctx );
		emitter.once( 'test', spy2 );

		emitter.fire( 'test' );

		sinon.assert.calledOn( spy1, ctx );
		sinon.assert.calledOn( spy2, emitter );
	} );

	it( 'should have proper arguments', () => {
		let spy = sinon.spy();

		emitter.once( 'test', spy );

		emitter.fire( 'test', 1, 2, 3 );

		sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), 1, 2, 3 );
	} );
} );

describe( 'off', () => {
	it( 'should get callbacks off()', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();
		let spy3 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );

		emitter.off( 'test', spy2 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledThrice( spy1 );
		sinon.assert.calledOnce( spy2 );
		sinon.assert.calledThrice( spy3 );
	} );

	it( 'should not fail with unknown events', () => {
		emitter.off( 'test', () => {} );
	} );

	it( 'should remove all entries for the same callback', () => {
		let spy1 = sinon.spy().named( 1 );
		let spy2 = sinon.spy().named( 2 );

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );

		emitter.fire( 'test' );

		emitter.off( 'test', spy1 );

		emitter.fire( 'test' );

		sinon.assert.callCount( spy1, 2 );
		sinon.assert.callCount( spy2, 4 );
	} );

	it( 'should remove the callback for given context only', () => {
		let spy = sinon.spy().named( 1 );

		let ctx1 = { ctx: 1 };
		let ctx2 = { ctx: 2 };

		emitter.on( 'test', spy, 'normal', ctx1 );
		emitter.on( 'test', spy, 'normal', ctx2 );

		emitter.fire( 'test' );

		spy.reset();

		emitter.off( 'test', spy, ctx1 );

		emitter.fire( 'test' );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledOn( spy, ctx2 );
	} );

	it( 'should properly remove callbacks for namespaced events', () => {
		let spyFoo = sinon.spy();
		let spyAbc = sinon.spy();
		let spyBar = sinon.spy();
		let spyFoo2 = sinon.spy();

		emitter.on( 'foo', spyFoo );
		emitter.on( 'foo:bar:abc', spyAbc );
		emitter.on( 'foo:bar', spyBar );
		emitter.on( 'foo', spyFoo2 );

		emitter.off( 'foo', spyFoo );

		emitter.fire( 'foo:bar:abc' );

		sinon.assert.calledOnce( spyAbc );
		sinon.assert.calledOnce( spyBar );
		sinon.assert.calledOnce( spyFoo2 );
		sinon.assert.notCalled( spyFoo );

		emitter.fire( 'foo:bar' );

		sinon.assert.notCalled( spyFoo );
		sinon.assert.calledOnce( spyAbc );
		sinon.assert.calledTwice( spyBar );
		sinon.assert.calledTwice( spyFoo2 );

		emitter.fire( 'foo' );

		sinon.assert.notCalled( spyFoo );
		sinon.assert.calledOnce( spyAbc );
		sinon.assert.calledTwice( spyBar );
		sinon.assert.calledThrice( spyFoo2 );
	} );
} );

describe( 'listenTo', () => {
	beforeEach( refreshListener );

	it( 'should properly register callbacks', () => {
		let spy = sinon.spy();

		listener.listenTo( emitter, 'test', spy );

		emitter.fire( 'test' );

		sinon.assert.called( spy );
	} );

	it( 'should correctly listen to namespaced events', () => {
		let spyFoo = sinon.spy();
		let spyBar = sinon.spy();

		listener.listenTo( emitter, 'foo', spyFoo );
		listener.listenTo( emitter, 'foo:bar', spyBar );

		emitter.fire( 'foo:bar' );

		sinon.assert.calledOnce( spyFoo );
		sinon.assert.calledOnce( spyBar );

		emitter.fire( 'foo' );

		sinon.assert.calledTwice( spyFoo );
		sinon.assert.calledOnce( spyBar );
	} );
} );

describe( 'stopListening', () => {
	beforeEach( refreshListener );

	it( 'should stop listening to given event callback', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();

		listener.listenTo( emitter, 'event1', spy1 );
		listener.listenTo( emitter, 'event2', spy2 );

		emitter.fire( 'event1' );
		emitter.fire( 'event2' );

		listener.stopListening( emitter, 'event1', spy1 );

		emitter.fire( 'event1' );
		emitter.fire( 'event2' );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledTwice( spy2 );
	} );

	it( 'should stop listening to given event', () => {
		let spy1a = sinon.spy();
		let spy1b = sinon.spy();
		let spy2 = sinon.spy();

		listener.listenTo( emitter, 'event1', spy1a );
		listener.listenTo( emitter, 'event1', spy1b );
		listener.listenTo( emitter, 'event2', spy2 );

		emitter.fire( 'event1' );
		emitter.fire( 'event2' );

		listener.stopListening( emitter, 'event1' );

		emitter.fire( 'event1' );
		emitter.fire( 'event2' );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );
	} );

	it( 'should stop listening to all events from given emitter', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();

		listener.listenTo( emitter, 'event1', spy1 );
		listener.listenTo( emitter, 'event2', spy2 );

		emitter.fire( 'event1' );
		emitter.fire( 'event2' );

		listener.stopListening( emitter );

		emitter.fire( 'event1' );
		emitter.fire( 'event2' );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledOnce( spy2 );
	} );

	it( 'should stop listening to everything', () => {
		let spy1 = sinon.spy();
		let spy2 = sinon.spy();

		let emitter1 = getEmitterInstance();
		let emitter2 = getEmitterInstance();

		listener.listenTo( emitter1, 'event1', spy1 );
		listener.listenTo( emitter2, 'event2', spy2 );

		expect( listener ).to.have.property( '_listeningTo' );

		emitter1.fire( 'event1' );
		emitter2.fire( 'event2' );

		listener.stopListening();

		emitter1.fire( 'event1' );
		emitter2.fire( 'event2' );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledOnce( spy2 );

		expect( listener ).to.not.have.property( '_listeningTo' );
	} );

	it( 'should not stop other emitters when a non-listened emitter is provided', () => {
		let spy = sinon.spy();

		let emitter1 = getEmitterInstance();
		let emitter2 = getEmitterInstance();

		listener.listenTo( emitter1, 'test', spy );

		listener.stopListening( emitter2 );

		emitter1.fire( 'test' );

		sinon.assert.called( spy );
	} );

	it( 'should correctly stop listening to namespaced events', () => {
		let spyFoo = sinon.spy();
		let spyBar = sinon.spy();

		listener.listenTo( emitter, 'foo', spyFoo );
		listener.listenTo( emitter, 'foo:bar', spyBar );

		listener.stopListening( emitter, 'foo' );

		emitter.fire( 'foo:bar' );

		sinon.assert.notCalled( spyFoo );
		sinon.assert.calledOnce( spyBar );
	} );
} );

describe( 'delegate', () => {
	it( 'should chain for a single event', () => {
		const emitter = getEmitterInstance();

		expect( emitter.delegate( 'foo' ) ).to.contain.keys( 'to' );
	} );

	it( 'should chain for multiple events', () => {
		const emitter = getEmitterInstance();

		expect( emitter.delegate( 'foo', 'bar' ) ).to.contain.keys( 'to' );
	} );

	describe( 'to', () => {
		it( 'forwards an event to another emitter', ( done ) => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const dataA = {};
			const dataB = {};

			emitterB.delegate( 'foo' ).to( emitterA );

			emitterA.on( 'foo', ( ...args ) => {
				assertDelegated( args, {
					expectedSource: emitterB,
					expectedName: 'foo',
					expectedPath: [ emitterB, emitterA ],
					expectedData: [ dataA, dataB ]
				} );

				done();
			} );

			emitterB.fire( 'foo', dataA, dataB );
		} );

		it( 'forwards multiple events to another emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const dataA = {};
			const dataB = {};

			emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA );

			const evts = [];

			function recordEvent( ...args ) {
				evts.push( args );
			}

			emitterA.on( 'foo', recordEvent );
			emitterA.on( 'bar', recordEvent );
			emitterA.on( 'baz', recordEvent );

			emitterB.fire( 'foo', dataA, dataB );

			expect( evts ).to.have.length( 1 );
			assertDelegated( evts[ 0 ], {
				expectedSource: emitterB,
				expectedName: 'foo',
				expectedPath: [ emitterB, emitterA ],
				expectedData: [ dataA, dataB ]
			} );

			emitterB.fire( 'bar' );

			expect( evts ).to.have.length( 2 );
			assertDelegated( evts[ 1 ], {
				expectedSource: emitterB,
				expectedName: 'bar',
				expectedPath: [ emitterB, emitterA ],
				expectedData: []
			} );

			emitterB.fire( 'baz' );

			expect( evts ).to.have.length( 3 );
			assertDelegated( evts[ 2 ], {
				expectedSource: emitterB,
				expectedName: 'baz',
				expectedPath: [ emitterB, emitterA ],
				expectedData: []
			} );

			emitterB.fire( 'not-delegated' );
			expect( evts ).to.have.length( 3 );
		} );

		it( 'does not forward events which are not supposed to be delegated', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();

			emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA );

			let fireLog = [];
			emitterA.on( 'foo', () => fireLog.push( 'A#foo' ) );
			emitterA.on( 'bar', () => fireLog.push( 'A#bar' ) );
			emitterA.on( 'baz', () => fireLog.push( 'A#baz' ) );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );
			emitterB.fire( 'baz' );
			emitterB.fire( 'not-delegated' );

			expect( fireLog ).to.deep.equal( [ 'A#foo', 'A#bar', 'A#baz' ] );
		} );

		it( 'supports deep chain event delegation', ( done ) => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const data = {};

			emitterC.delegate( 'foo' ).to( emitterB );
			emitterB.delegate( 'foo' ).to( emitterA );

			emitterA.on( 'foo', ( ...args ) => {
				assertDelegated( args, {
					expectedSource: emitterC,
					expectedName: 'foo',
					expectedPath: [ emitterC, emitterB, emitterA ],
					expectedData: [ data ]
				} );

				done();
			} );

			emitterC.fire( 'foo', data );
		} );

		it( 'executes callbacks first, then delegates further', ( done ) => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const callOrder = [];

			emitterB.delegate( 'foo' ).to( emitterA );

			emitterA.on( 'foo', () => {
				callOrder.push( 'emitterA' );
				expect( callOrder ).to.deep.equal( [ 'emitterB', 'emitterA' ] );
				done();
			} );

			emitterB.on( 'foo', () => {
				callOrder.push( 'emitterB' );
			} );

			emitterB.fire( 'foo' );
		} );
	} );
} );

describe( 'stopDelegating', () => {
	it( 'passes if no delegation was set', () => {
		expect( () => {
			getEmitterInstance().stopDelegating();
		} ).to.not.throw();
	} );

	it( 'stops delegating all events to all emitters', () => {
		const emitterA = getEmitterInstance();
		const emitterB = getEmitterInstance();
		const emitterC = getEmitterInstance();

		emitterA.delegate( 'foo' ).to( emitterB );
		emitterA.delegate( 'bar' ).to( emitterC );

		let fireLog = [];
		emitterB.on( 'foo', () => fireLog.push( 'B#foo' ) );
		emitterC.on( 'bar', () => fireLog.push( 'C#bar' ) );

		emitterA.fire( 'foo' );
		emitterA.fire( 'bar' );

		expect( fireLog ).to.deep.equal( [ 'B#foo', 'C#bar' ] );

		emitterA.stopDelegating();

		emitterA.fire( 'foo' );
		emitterA.fire( 'bar' );

		expect( fireLog ).to.deep.equal( [ 'B#foo', 'C#bar' ] );
	} );

	it( 'stops delegating a specific event to all emitters', () => {
		const emitterA = getEmitterInstance();
		const emitterB = getEmitterInstance();
		const emitterC = getEmitterInstance();

		emitterA.delegate( 'foo' ).to( emitterB );
		emitterA.delegate( 'foo' ).to( emitterC );
		emitterA.delegate( 'bar' ).to( emitterC );

		let fireLog = [];
		emitterB.on( 'foo', () => fireLog.push( 'B#foo' ) );
		emitterC.on( 'foo', () => fireLog.push( 'C#foo' ) );
		emitterC.on( 'bar', () => fireLog.push( 'C#bar' ) );

		emitterA.fire( 'foo' );
		emitterA.fire( 'bar' );

		expect( fireLog ).to.deep.equal( [ 'B#foo', 'C#foo', 'C#bar' ] );

		emitterA.stopDelegating( 'foo' );

		emitterA.fire( 'foo' );
		emitterA.fire( 'bar' );

		expect( fireLog ).to.deep.equal( [ 'B#foo', 'C#foo', 'C#bar', 'C#bar' ] );
	} );

	it( 'stops delegating a specific event to a specific emitter', () => {
		const emitterA = getEmitterInstance();
		const emitterB = getEmitterInstance();
		const emitterC = getEmitterInstance();

		emitterA.delegate( 'foo' ).to( emitterB );
		emitterA.delegate( 'foo' ).to( emitterC );

		let fireLog = [];
		emitterB.on( 'foo', () => fireLog.push( 'B#foo' ) );
		emitterC.on( 'foo', () => fireLog.push( 'C#foo' ) );

		emitterA.fire( 'foo' );

		expect( fireLog ).to.deep.equal( [ 'B#foo', 'C#foo' ] );

		emitterA.stopDelegating( 'foo', emitterC );
		emitterA.fire( 'foo' );

		expect( fireLog ).to.deep.equal( [ 'B#foo', 'C#foo', 'B#foo' ] );
	} );

	it( 'passes when stopping delegation of a specific event to an emitter which wasn\'t a destination', () => {
		const emitterA = getEmitterInstance();
		const emitterB = getEmitterInstance();
		const emitterC = getEmitterInstance();

		emitterA.delegate( 'foo' ).to( emitterB );

		expect( () => {
			emitterA.stopDelegating( 'foo', emitterC );
		} ).to.not.throw();
	} );
} );

function refreshEmitter() {
	emitter = getEmitterInstance();
}

function refreshListener() {
	listener = getEmitterInstance();
}

function getEmitterInstance() {
	return Object.create( EmitterMixin );
}

function assertDelegated( evtArgs, { expectedName, expectedSource, expectedPath, expectedData } ) {
	const evtInfo = evtArgs[ 0 ];

	expect( evtInfo.name ).to.equal( expectedName );
	expect( evtInfo.source ).to.equal( expectedSource );
	expect( evtInfo.path ).to.deep.equal( expectedPath );
	expect( evtArgs.slice( 1 ) ).to.deep.equal( expectedData );
}
