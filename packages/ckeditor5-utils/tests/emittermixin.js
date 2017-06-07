/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { default as EmitterMixin, _getEmitterListenedTo, _getEmitterId, _setEmitterId } from '../src/emittermixin';
import EventInfo from '../src/eventinfo';

describe( 'EmitterMixin', () => {
	let emitter, listener;

	beforeEach( () => {
		emitter = getEmitterInstance();
		listener = getEmitterInstance();
	} );

	describe( 'fire', () => {
		it( 'should execute callbacks in the right order without priority', () => {
			const spy1 = sinon.spy().named( 1 );
			const spy2 = sinon.spy().named( 2 );
			const spy3 = sinon.spy().named( 3 );

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );
			emitter.on( 'test', spy3 );

			emitter.fire( 'test' );

			sinon.assert.callOrder( spy1, spy2, spy3 );
		} );

		it( 'should execute callbacks in the right order with priority defined', () => {
			const spy1 = sinon.spy().named( 1 );
			const spy2 = sinon.spy().named( 2 );
			const spy3 = sinon.spy().named( 3 );
			const spy4 = sinon.spy().named( 4 );
			const spy5 = sinon.spy().named( 5 );

			emitter.on( 'test', spy2, { priority: 'high' } );
			emitter.on( 'test', spy3 ); // Defaults to 'normal'.
			emitter.on( 'test', spy4, { priority: 'low' } );
			emitter.on( 'test', spy1, { priority: 'highest' } );
			emitter.on( 'test', spy5, { priority: 'lowest' } );

			emitter.fire( 'test' );

			sinon.assert.callOrder( spy1, spy2, spy3, spy4, spy5 );
		} );

		it( 'should pass arguments to callbacks', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );

			emitter.fire( 'test', 1, 'b', true );

			sinon.assert.calledWithExactly( spy1, sinon.match.instanceOf( EventInfo ), 1, 'b', true );
			sinon.assert.calledWithExactly( spy2, sinon.match.instanceOf( EventInfo ), 1, 'b', true );
		} );

		it( 'should pass proper context to callbacks', () => {
			const ctx1 = {};
			const ctx2 = {};

			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy();

			emitter.on( 'test', spy1, { context: ctx1 } );
			emitter.on( 'test', spy2, { context: ctx2 } );
			emitter.on( 'test', spy3 );

			emitter.fire( 'test' );

			sinon.assert.calledOn( spy1, ctx1 );
			sinon.assert.calledOn( spy2, ctx2 );
			sinon.assert.calledOn( spy3, emitter );
		} );

		it( 'should fire the right event', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			emitter.on( '1', spy1 );
			emitter.on( '2', spy2 );

			emitter.fire( '2' );

			sinon.assert.notCalled( spy1 );
			sinon.assert.called( spy2 );
		} );

		it( 'should execute callbacks many times', () => {
			const spy = sinon.spy();

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
			const spy = sinon.spy();

			emitter.on( 'test', spy );
			emitter.on( 'test', spy );
			emitter.on( 'test', spy );

			emitter.fire( 'test' );

			sinon.assert.calledThrice( spy );
		} );

		it( 'should not fire callbacks for an event that were added while firing that event', () => {
			const spy = sinon.spy();

			emitter.on( 'test', () => {
				emitter.on( 'test', spy );
			} );

			emitter.fire( 'test' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should correctly fire callbacks for namespaced events', () => {
			const spyFoo = sinon.spy();
			const spyBar = sinon.spy();
			const spyAbc = sinon.spy();
			const spyFoo2 = sinon.spy();

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

		describe( 'return value', () => {
			it( 'is undefined by default', () => {
				expect( emitter.fire( 'foo' ) ).to.be.undefined;
			} );

			it( 'is undefined if none of the listeners modified EventInfo#return', () => {
				emitter.on( 'foo', () => {} );

				expect( emitter.fire( 'foo' ) ).to.be.undefined;
			} );

			it( 'equals EventInfo#return\'s value', () => {
				emitter.on( 'foo', evt => {
					evt.return = 1;
				} );

				expect( emitter.fire( 'foo' ) ).to.equal( 1 );
			} );

			it( 'equals EventInfo#return\'s value even if the event was stopped', () => {
				emitter.on( 'foo', evt => {
					evt.return = 1;
				} );
				emitter.on( 'foo', evt => {
					evt.stop();
				} );

				expect( emitter.fire( 'foo' ) ).to.equal( 1 );
			} );

			it( 'equals EventInfo#return\'s value when it was set in a namespaced event', () => {
				emitter.on( 'foo', evt => {
					evt.return = 1;
				} );

				expect( emitter.fire( 'foo:bar' ) ).to.equal( 1 );
			} );

			// Rationale – delegation keeps the listeners of the two objects separate.
			// E.g. the emitterB's listeners will always be executed before emitterA's ones.
			// Hence, values should not be shared either.
			it( 'is not affected by listeners executed on emitter to which the event was delegated', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();

				emitterB.delegate( 'foo' ).to( emitterA );

				emitterA.on( 'foo', evt => {
					evt.return = 1;
				} );

				expect( emitterB.fire( 'foo' ) ).to.be.undefined;
			} );

			it( 'equals the value set by the last callback', () => {
				emitter.on( 'foo', evt => {
					evt.return = 1;
				} );
				emitter.on( 'foo', evt => {
					evt.return = 2;
				}, { priority: 'high' } );

				expect( emitter.fire( 'foo' ) ).to.equal( 1 );
			} );
		} );
	} );

	describe( 'on', () => {
		it( 'should stop()', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy( event => {
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
			const spy1 = sinon.spy();
			const spy2 = sinon.spy( event => {
				event.off();
			} );
			const spy3 = sinon.spy();

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
			const spy1 = sinon.spy( event => {
				event.stop();
				event.off();
			} );
			const spy2 = sinon.spy();

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
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy();

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
			const ctx = {};

			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			emitter.once( 'test', spy1, { context: ctx } );
			emitter.once( 'test', spy2 );

			emitter.fire( 'test' );

			sinon.assert.calledOn( spy1, ctx );
			sinon.assert.calledOn( spy2, emitter );
		} );

		it( 'should have proper arguments', () => {
			const spy = sinon.spy();

			emitter.once( 'test', spy );

			emitter.fire( 'test', 1, 2, 3 );

			sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), 1, 2, 3 );
		} );
	} );

	describe( 'off', () => {
		it( 'should get callbacks off()', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy();

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
			const spy1 = sinon.spy().named( 1 );
			const spy2 = sinon.spy().named( 2 );

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
			const spy = sinon.spy().named( 1 );

			const ctx1 = { context: 1 };
			const ctx2 = { context: 2 };

			emitter.on( 'test', spy, { context: ctx1 } );
			emitter.on( 'test', spy, { context: ctx2 } );

			emitter.fire( 'test' );

			spy.reset();

			emitter.off( 'test', spy, ctx1 );

			emitter.fire( 'test' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledOn( spy, ctx2 );
		} );

		it( 'should properly remove callbacks for namespaced events', () => {
			const spyFoo = sinon.spy();
			const spyAbc = sinon.spy();
			const spyBar = sinon.spy();
			const spyFoo2 = sinon.spy();

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
		it( 'should properly register callbacks', () => {
			const spy = sinon.spy();

			listener.listenTo( emitter, 'test', spy );

			emitter.fire( 'test' );

			sinon.assert.called( spy );
		} );

		it( 'should correctly listen to namespaced events', () => {
			const spyFoo = sinon.spy();
			const spyBar = sinon.spy();

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
		it( 'should stop listening to given event callback', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

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
			const spy1a = sinon.spy();
			const spy1b = sinon.spy();
			const spy2 = sinon.spy();

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
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

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
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			const emitter1 = getEmitterInstance();
			const emitter2 = getEmitterInstance();

			listener.listenTo( emitter1, 'event1', spy1 );
			listener.listenTo( emitter2, 'event2', spy2 );

			emitter1.fire( 'event1' );
			emitter2.fire( 'event2' );

			listener.stopListening();

			emitter1.fire( 'event1' );
			emitter2.fire( 'event2' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
		} );

		it( 'should not stop other emitters when a non-listened emitter is provided', () => {
			const spy = sinon.spy();

			const emitter1 = getEmitterInstance();
			const emitter2 = getEmitterInstance();

			listener.listenTo( emitter1, 'test', spy );

			listener.stopListening( emitter2 );

			emitter1.fire( 'test' );

			sinon.assert.called( spy );
		} );

		it( 'should correctly stop listening to namespaced events', () => {
			const spyFoo = sinon.spy();
			const spyBar = sinon.spy();

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
			it( 'forwards an event to another emitter', done => {
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
				const spyFoo = sinon.spy();
				const spyBar = sinon.spy();
				const spyBaz = sinon.spy();
				const dataA = {};
				const dataB = {};

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA );

				emitterA.on( 'foo', spyFoo );
				emitterA.on( 'bar', spyBar );
				emitterA.on( 'baz', spyBaz );

				emitterB.fire( 'foo', dataA, dataB );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.notCalled( spyBar );
				sinon.assert.notCalled( spyBaz );

				assertDelegated( spyFoo.args[ 0 ], {
					expectedSource: emitterB,
					expectedName: 'foo',
					expectedPath: [ emitterB, emitterA ],
					expectedData: [ dataA, dataB ]
				} );

				emitterB.fire( 'bar' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.notCalled( spyBaz );

				assertDelegated( spyBar.args[ 0 ], {
					expectedSource: emitterB,
					expectedName: 'bar',
					expectedPath: [ emitterB, emitterA ],
					expectedData: []
				} );

				emitterB.fire( 'baz' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.calledOnce( spyBaz );

				assertDelegated( spyBaz.args[ 0 ], {
					expectedSource: emitterB,
					expectedName: 'baz',
					expectedPath: [ emitterB, emitterA ],
					expectedData: []
				} );

				emitterB.fire( 'not-delegated' );

				sinon.assert.calledOnce( spyFoo );
				sinon.assert.calledOnce( spyBar );
				sinon.assert.calledOnce( spyBaz );
			} );

			it( 'does not forward events which are not supposed to be delegated', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyFoo = sinon.spy();
				const spyBar = sinon.spy();
				const spyBaz = sinon.spy();

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA );

				emitterA.on( 'foo', spyFoo );
				emitterA.on( 'bar', spyBar );
				emitterA.on( 'baz', spyBaz );

				emitterB.fire( 'foo' );
				emitterB.fire( 'bar' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'not-delegated' );

				sinon.assert.callOrder( spyFoo, spyBar, spyBaz );
				sinon.assert.callCount( spyFoo, 1 );
				sinon.assert.callCount( spyBar, 1 );
				sinon.assert.callCount( spyBaz, 1 );
			} );

			it( 'supports deep chain event delegation', done => {
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

			it( 'preserves path in event delegation', done => {
				const data = {};
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const emitterC = getEmitterInstance();
				const emitterD = getEmitterInstance();

				emitterB.delegate( 'foo' ).to( emitterA );
				emitterB.delegate( 'foo' ).to( emitterC );
				emitterB.delegate( 'foo' ).to( emitterD );

				emitterD.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedSource: emitterB,
						expectedName: 'foo',
						expectedPath: [ emitterB, emitterD ],
						expectedData: [ data ]
					} );

					done();
				} );

				emitterB.fire( 'foo', data );
				emitterC.fire( 'foo', data );
			} );

			it( 'executes callbacks first, then delegates further', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyA = sinon.spy();
				const spyB = sinon.spy();

				emitterB.delegate( 'foo' ).to( emitterA );

				emitterA.on( 'foo', spyA );
				emitterB.on( 'foo', spyB );

				emitterB.fire( 'foo' );

				sinon.assert.callOrder( spyB, spyA );
			} );

			it( 'supports delegation under a different name', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const emitterC = getEmitterInstance();
				const emitterD = getEmitterInstance();
				const spyAFoo = sinon.spy();
				const spyABar = sinon.spy();
				const spyCBaz = sinon.spy();
				const spyDFoo = sinon.spy();

				emitterB.delegate( 'foo' ).to( emitterA, 'bar' );
				emitterB.delegate( 'foo' ).to( emitterC, name => name + '-baz' );
				emitterB.delegate( 'foo' ).to( emitterD );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterC.on( 'foo-baz', spyCBaz );
				emitterD.on( 'foo', spyDFoo );

				emitterB.fire( 'foo' );

				sinon.assert.calledOnce( spyABar );
				sinon.assert.calledOnce( spyCBaz );
				sinon.assert.calledOnce( spyDFoo );
				sinon.assert.notCalled( spyAFoo );
			} );

			it( 'supports delegation under a different name with multiple events', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = sinon.spy();
				const spyABar = sinon.spy();
				const spyABaz = sinon.spy();
				const spyAQux = sinon.spy();

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA, 'qux' );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterA.on( 'baz', spyABaz );
				emitterA.on( 'qux', spyAQux );

				emitterB.fire( 'foo' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'bar' );

				sinon.assert.notCalled( spyAFoo );
				sinon.assert.notCalled( spyABar );
				sinon.assert.notCalled( spyABaz );

				sinon.assert.calledThrice( spyAQux );
			} );

			it( 'supports delegation with multiple events, each under a different name', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = sinon.spy();
				const spyABar = sinon.spy();
				const spyABaz = sinon.spy();
				const spyAFooQux = sinon.spy();
				const spyABarQux = sinon.spy();
				const spyABazQux = sinon.spy();

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA, name => name + '-qux' );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterA.on( 'baz', spyABaz );

				emitterA.on( 'foo-qux', spyAFooQux );
				emitterA.on( 'bar-qux', spyABarQux );
				emitterA.on( 'baz-qux', spyABazQux );

				emitterB.fire( 'foo' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'bar' );

				sinon.assert.notCalled( spyAFoo );
				sinon.assert.notCalled( spyABar );
				sinon.assert.notCalled( spyABaz );

				sinon.assert.calledOnce( spyAFooQux );
				sinon.assert.calledOnce( spyABarQux );
				sinon.assert.calledOnce( spyABazQux );

				sinon.assert.callOrder( spyAFooQux, spyABazQux, spyABarQux );
			} );

			it( 'preserves path in delegation under a different name', done => {
				const data = {};
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const emitterC = getEmitterInstance();
				const emitterD = getEmitterInstance();

				emitterB.delegate( 'foo' ).to( emitterA, 'bar' );
				emitterB.delegate( 'foo' ).to( emitterC, 'baz' );
				emitterB.delegate( 'foo' ).to( emitterD );

				emitterD.on( 'foo', ( ...args ) => {
					assertDelegated( args, {
						expectedSource: emitterB,
						expectedName: 'foo',
						expectedPath: [ emitterB, emitterD ],
						expectedData: [ data ]
					} );

					done();
				} );

				emitterB.fire( 'foo', data );
			} );

			it( 'supports delegation of all events', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = sinon.spy();
				const spyABar = sinon.spy();
				const spyABaz = sinon.spy();

				emitterB.delegate( '*' ).to( emitterA );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterA.on( 'baz', spyABaz );

				emitterB.fire( 'foo' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'bar' );

				sinon.assert.callOrder( spyAFoo, spyABaz, spyABar );
			} );

			it( 'supports delegation of all events under different names', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = sinon.spy();
				const spyABar = sinon.spy();
				const spyABaz = sinon.spy();
				const spyAFooDel = sinon.spy();
				const spyABarDel = sinon.spy();
				const spyABazDel = sinon.spy();

				emitterB.delegate( '*' ).to( emitterA, name => name + '-delegated' );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterA.on( 'baz', spyABaz );

				emitterA.on( 'foo-delegated', spyAFooDel );
				emitterA.on( 'bar-delegated', spyABarDel );
				emitterA.on( 'baz-delegated', spyABazDel );

				emitterB.fire( 'foo' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'bar' );

				sinon.assert.notCalled( spyAFoo );
				sinon.assert.notCalled( spyABar );
				sinon.assert.notCalled( spyABaz );

				sinon.assert.callOrder( spyAFooDel, spyABazDel, spyABarDel );
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
			const spyFoo = sinon.spy();
			const spyBar = sinon.spy();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'bar' ).to( emitterC );

			emitterB.on( 'foo', spyFoo );
			emitterC.on( 'bar', spyBar );

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			sinon.assert.callOrder( spyFoo, spyBar );

			emitterA.stopDelegating();

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			sinon.assert.callOrder( spyFoo, spyBar );
		} );

		it( 'stops delegating a specific event to all emitters', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyFooB = sinon.spy();
			const spyFooC = sinon.spy();
			const spyBarC = sinon.spy();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'foo' ).to( emitterC );
			emitterA.delegate( 'bar' ).to( emitterC );

			emitterB.on( 'foo', spyFooB );
			emitterC.on( 'foo', spyFooC );
			emitterC.on( 'bar', spyBarC );

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			sinon.assert.callOrder( spyFooB, spyFooC, spyBarC );

			emitterA.stopDelegating( 'foo' );

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			sinon.assert.callOrder( spyFooB, spyFooC, spyBarC, spyBarC );
		} );

		it( 'stops delegating a specific event to a specific emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyFooB = sinon.spy();
			const spyFooC = sinon.spy();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'foo' ).to( emitterC );

			emitterB.on( 'foo', spyFooB );
			emitterC.on( 'foo', spyFooC );

			emitterA.fire( 'foo' );

			sinon.assert.callOrder( spyFooB, spyFooC );

			emitterA.stopDelegating( 'foo', emitterC );
			emitterA.fire( 'foo' );

			sinon.assert.callOrder( spyFooB, spyFooC, spyFooB );
		} );

		it( 'stops delegating a specific event under a different name to a specific emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyFooB = sinon.spy();
			const spyFooC = sinon.spy();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'foo' ).to( emitterC, 'bar' );

			emitterB.on( 'foo', spyFooB );
			emitterC.on( 'bar', spyFooC );

			emitterA.fire( 'foo' );

			sinon.assert.callOrder( spyFooB, spyFooC );

			emitterA.stopDelegating( 'foo', emitterC );
			emitterA.fire( 'foo' );

			sinon.assert.callOrder( spyFooB, spyFooC, spyFooB );
		} );

		it( 'stops delegating all ("*")', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyAFoo = sinon.spy();
			const spyABar = sinon.spy();
			const spyCFoo = sinon.spy();
			const spyCBar = sinon.spy();

			emitterB.delegate( '*' ).to( emitterA );
			emitterB.delegate( '*' ).to( emitterC );

			emitterA.on( 'foo', spyAFoo );
			emitterA.on( 'bar', spyABar );
			emitterC.on( 'foo', spyCFoo );
			emitterC.on( 'bar', spyCBar );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			sinon.assert.calledOnce( spyAFoo );
			sinon.assert.calledOnce( spyABar );
			sinon.assert.calledOnce( spyCFoo );
			sinon.assert.calledOnce( spyCBar );

			emitterB.stopDelegating( '*' );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			sinon.assert.calledOnce( spyAFoo );
			sinon.assert.calledOnce( spyABar );
			sinon.assert.calledOnce( spyCFoo );
			sinon.assert.calledOnce( spyCBar );
		} );

		it( 'stops delegating all ("*") to a specific emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyAFoo = sinon.spy();
			const spyABar = sinon.spy();
			const spyCFoo = sinon.spy();
			const spyCBar = sinon.spy();

			emitterB.delegate( '*' ).to( emitterA );
			emitterB.delegate( 'foo' ).to( emitterC );

			emitterA.on( 'foo', spyAFoo );
			emitterA.on( 'bar', spyABar );
			emitterC.on( 'foo', spyCFoo );
			emitterC.on( 'bar', spyCBar );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			sinon.assert.calledOnce( spyAFoo );
			sinon.assert.calledOnce( spyABar );
			sinon.assert.calledOnce( spyCFoo );
			sinon.assert.notCalled( spyCBar );

			emitterB.stopDelegating( '*', emitterA );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			sinon.assert.calledOnce( spyAFoo );
			sinon.assert.calledOnce( spyABar );
			sinon.assert.calledTwice( spyCFoo );
			sinon.assert.notCalled( spyCBar );
		} );

		it( 'passes when stopping delegation of a specific event which has never been delegated', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();

			expect( () => {
				emitterA.stopDelegating( 'bar' );
				emitterA.stopDelegating( 'bar', emitterB );
			} ).to.not.throw();
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

		it( 'passes when stopping delegation of a specific event to a specific emitter which has never been delegated', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();

			emitterA.delegate( 'foo' ).to( emitterB );

			expect( () => {
				emitterA.stopDelegating( 'bar', emitterC );
			} ).to.not.throw();
		} );
	} );

	function assertDelegated( evtArgs, { expectedName, expectedSource, expectedPath, expectedData } ) {
		const evtInfo = evtArgs[ 0 ];

		expect( evtInfo.name ).to.equal( expectedName );
		expect( evtInfo.source ).to.equal( expectedSource );
		expect( evtInfo.path ).to.deep.equal( expectedPath );
		expect( evtArgs.slice( 1 ) ).to.deep.equal( expectedData );
	}
} );

describe( 'emitter id', () => {
	let emitter;

	beforeEach( () => {
		emitter = getEmitterInstance();
	} );

	it( 'should be undefined before it is set', () => {
		expect( _getEmitterId( emitter ) ).to.be.undefined;
	} );

	it( 'should be settable but only once', () => {
		_setEmitterId( emitter, 'abc' );

		expect( _getEmitterId( emitter ) ).to.equal( 'abc' );

		_setEmitterId( emitter, 'xyz' );

		expect( _getEmitterId( emitter ) ).to.equal( 'abc' );
	} );
} );

describe( '_getEmitterListenedTo', () => {
	let emitter, listener;

	beforeEach( () => {
		emitter = getEmitterInstance();
		listener = getEmitterInstance();
	} );

	it( 'should return null if listener do not listen to emitter with given id', () => {
		expect( _getEmitterListenedTo( listener, 'abc' ) ).to.be.null;
	} );

	it( 'should return emitter with given id', () => {
		listener.listenTo( emitter, 'eventName', () => {} );
		const emitterId = _getEmitterId( emitter );

		expect( _getEmitterListenedTo( listener, emitterId ) ).to.equal( emitter );
	} );
} );

function getEmitterInstance() {
	return Object.create( EmitterMixin );
}
