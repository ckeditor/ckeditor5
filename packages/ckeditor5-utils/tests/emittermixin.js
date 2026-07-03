/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmitterMixin, _getEmitterListenedTo, _getEmitterId, _setEmitterId } from '../src/emittermixin.js';
import { EventInfo } from '../src/eventinfo.js';
import { expectToThrowCKEditorError } from './_utils/utils.js';
import { CKEditorError } from '../src/ckeditorerror.js';

describe( 'EmitterMixin', () => {
	let emitter, listener;

	beforeEach( () => {
		emitter = getEmitterInstance();
		listener = getEmitterInstance();
	} );

	it( 'should inherit from the given class', () => {
		class TestClass {
			constructor( value ) {
				this.value = value;
			}
		}

		const EmitterClass = EmitterMixin( TestClass );

		const emitter = new EmitterClass( 5 );

		expect( emitter ).to.be.instanceOf( TestClass );
		expect( emitter.value ).to.equal( 5 );
	} );

	describe( 'fire', () => {
		it( 'should execute callbacks in the right order without priority', () => {
			const spy1 = vi.fn().mockName( '1' );
			const spy2 = vi.fn().mockName( '2' );
			const spy3 = vi.fn().mockName( '3' );

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );
			emitter.on( 'test', spy3 );

			emitter.fire( 'test' );

			expectCallOrder( spy1, spy2, spy3 );
		} );

		it( 'should execute callbacks in the right order with priority defined', () => {
			const spy1 = vi.fn().mockName( '1' );
			const spy2 = vi.fn().mockName( '2' );
			const spy3 = vi.fn().mockName( '3' );
			const spy4 = vi.fn().mockName( '4' );
			const spy5 = vi.fn().mockName( '5' );

			emitter.on( 'test', spy2, { priority: 'high' } );
			emitter.on( 'test', spy3 ); // Defaults to 'normal'.
			emitter.on( 'test', spy4, { priority: 'low' } );
			emitter.on( 'test', spy1, { priority: 'highest' } );
			emitter.on( 'test', spy5, { priority: 'lowest' } );

			emitter.fire( 'test' );

			expectCallOrder( spy1, spy2, spy3, spy4, spy5 );
		} );

		it( 'should pass arguments to callbacks', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );

			emitter.fire( 'test', 1, 'b', true );

			expect( spy1 ).toHaveBeenCalledWith( expect.any( EventInfo ), 1, 'b', true );
			expect( spy2 ).toHaveBeenCalledWith( expect.any( EventInfo ), 1, 'b', true );
		} );

		it( 'should fire the right event', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			emitter.on( '1', spy1 );
			emitter.on( '2', spy2 );

			emitter.fire( '2' );

			expect( spy1 ).not.toHaveBeenCalled();
			expect( spy2 ).toHaveBeenCalled();
		} );

		it( 'should execute callbacks many times', () => {
			const spy = vi.fn();

			emitter.on( 'test', spy );

			emitter.fire( 'test' );
			emitter.fire( 'test' );
			emitter.fire( 'test' );

			expect( spy ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should do nothing for a non listened event', () => {
			emitter.fire( 'test' );
		} );

		it( 'should accept the same callback many times', () => {
			const spy = vi.fn();

			emitter.on( 'test', spy );
			emitter.on( 'test', spy );
			emitter.on( 'test', spy );

			emitter.fire( 'test' );

			expect( spy ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should not fire callbacks for an event that were added while firing that event', () => {
			const spy = vi.fn();

			emitter.on( 'test', () => {
				emitter.on( 'test', spy );
			} );

			emitter.fire( 'test' );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should correctly fire callbacks for namespaced events', () => {
			const spyFoo = vi.fn();
			const spyBar = vi.fn();
			const spyAbc = vi.fn();
			const spyFoo2 = vi.fn();

			// Mess up with callbacks order to check whether they are called in adding order.
			emitter.on( 'foo', spyFoo );
			emitter.on( 'foo:bar:abc', spyAbc );
			emitter.on( 'foo:bar', spyBar );

			// This tests whether generic callbacks are also added to specific callbacks lists.
			emitter.on( 'foo', spyFoo2 );

			// All four callbacks should be fired.
			emitter.fire( 'foo:bar:abc' );

			expectCallOrder( spyFoo, spyAbc, spyBar, spyFoo2 );
			expect( spyFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyAbc ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).toHaveBeenCalledTimes( 1 );
			expect( spyFoo2 ).toHaveBeenCalledTimes( 1 );

			// Only callbacks for foo and foo:bar event should be called.
			emitter.fire( 'foo:bar' );

			expect( spyAbc ).toHaveBeenCalledTimes( 1 );
			expect( spyFoo ).toHaveBeenCalledTimes( 2 );
			expect( spyBar ).toHaveBeenCalledTimes( 2 );
			expect( spyFoo2 ).toHaveBeenCalledTimes( 2 );

			// Only callback for foo should be called as foo:abc has not been registered.
			// Still, foo is a valid, existing namespace.
			emitter.fire( 'foo:abc' );

			expect( spyAbc ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).toHaveBeenCalledTimes( 2 );
			expect( spyFoo ).toHaveBeenCalledTimes( 3 );
			expect( spyFoo2 ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should rethrow the CKEditorError error', () => {
			emitter.on( 'test', () => {
				throw new CKEditorError( 'foo', null );
			} );

			expectToThrowCKEditorError( () => {
				emitter.fire( 'test' );
			}, /foo/, null );
		} );

		it.skip( 'should rethrow the native errors as they are in the dubug=true mode', () => {
			const error = new TypeError( 'foo' );

			emitter.on( 'test', () => {
				throw error;
			} );

			expect( () => {
				emitter.fire( 'test' );
			} ).to.throw( TypeError, /foo/ );
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
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn( event => {
				event.stop();
			} );

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );
			emitter.on( 'test', spy3 );
			emitter.on( 'test', vi.fn( () => {
				throw new Error( 'Unexpected call' );
			} ) );
			emitter.on( 'test', vi.fn( () => {
				throw new Error( 'Unexpected call' );
			} ) );

			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalled();
			expect( spy2 ).toHaveBeenCalled();
			expect( spy3 ).toHaveBeenCalled();
		} );

		it( 'should take a callback off()', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn( event => {
				event.off();
			} );
			const spy3 = vi.fn();

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );
			emitter.on( 'test', spy3 );

			emitter.fire( 'test' );
			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalledTimes( 2 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should take the callback off() even after stop()', () => {
			const spy1 = vi.fn( event => {
				event.stop();
				event.off();
			} );
			const spy2 = vi.fn();

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );

			emitter.fire( 'test' );
			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'once', () => {
		it( 'should be called just once for general event', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();

			emitter.on( 'test', spy1 );
			emitter.once( 'test', spy2 );
			emitter.on( 'test', spy3 );

			emitter.fire( 'test' );
			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalledTimes( 2 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should be called just once for namespaced event', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();

			emitter.on( 'foo:bar', spy1 );
			emitter.once( 'foo:bar', spy2 );
			emitter.on( 'foo:bar', spy3 );

			emitter.fire( 'foo:bar' );
			emitter.fire( 'foo:bar' );

			expect( spy1 ).toHaveBeenCalledTimes( 2 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should have proper arguments', () => {
			const spy = vi.fn();

			emitter.once( 'test', spy );

			emitter.fire( 'test', 1, 2, 3 );

			expect( spy ).toHaveBeenCalledWith( expect.any( EventInfo ), 1, 2, 3 );
		} );

		it( 'should be removed also when fired through namespaced event', () => {
			const spy = vi.fn();

			emitter.once( 'foo', spy );

			emitter.fire( 'foo:bar' );
			emitter.fire( 'foo' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should be called only once and have infinite loop protection', () => {
			const spy = vi.fn();

			emitter.once( 'foo', () => {
				spy();

				emitter.fire( 'foo' );
			} );

			emitter.fire( 'foo' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'off', () => {
		it( 'should get callbacks off()', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );
			emitter.on( 'test', spy3 );

			emitter.fire( 'test' );

			emitter.off( 'test', spy2 );

			emitter.fire( 'test' );
			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalledTimes( 3 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should remove all callbacks for event', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );

			emitter.fire( 'test' );

			emitter.off( 'test' );

			emitter.fire( 'test' );
			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not fail with unknown events', () => {
			emitter.off( 'foo', () => {} );
			emitter.off( 'foo:bar', () => {} );

			emitter.off( 'foo' );
			emitter.off( 'foo:bar' );
		} );

		it( 'should remove all entries for the same callback', () => {
			const spy1 = vi.fn().mockName( '1' );
			const spy2 = vi.fn().mockName( '2' );

			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );
			emitter.on( 'test', spy1 );
			emitter.on( 'test', spy2 );

			emitter.fire( 'test' );

			emitter.off( 'test', spy1 );

			emitter.fire( 'test' );

			expect( spy1 ).toHaveBeenCalledTimes( 2 );
			expect( spy2 ).toHaveBeenCalledTimes( 4 );
		} );

		it( 'should not remove all namespaced entries when removing namespace inner group', () => {
			const spy1 = vi.fn().mockName( 'foo' );
			const spy2 = vi.fn().mockName( 'foo:bar' );
			const spy3 = vi.fn().mockName( 'foo:bar:baz' );
			const spy4 = vi.fn().mockName( 'foo:bar:baz:abc' );

			emitter.on( 'foo', spy1 );
			emitter.on( 'foo:bar', spy2 );
			emitter.on( 'foo:bar:baz', spy3 );
			emitter.on( 'foo:bar:baz:abc', spy4 );

			emitter.fire( 'foo:bar:baz:abc' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 1 );
			expect( spy4 ).toHaveBeenCalledTimes( 1 );

			emitter.off( 'foo:bar' );

			emitter.fire( 'foo:bar:baz:abc' );

			expect( spy1 ).toHaveBeenCalledTimes( 2 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 2 );
			expect( spy4 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should properly remove callbacks for namespaced events', () => {
			const spyFoo = vi.fn();
			const spyAbc = vi.fn();
			const spyBar = vi.fn();
			const spyFoo2 = vi.fn();

			emitter.on( 'foo', spyFoo );
			emitter.on( 'foo:bar:abc', spyAbc );
			emitter.on( 'foo:bar', spyBar );
			emitter.on( 'foo', spyFoo2 );

			emitter.off( 'foo', spyFoo );

			emitter.fire( 'foo:bar:abc' );

			expect( spyAbc ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).toHaveBeenCalledTimes( 1 );
			expect( spyFoo2 ).toHaveBeenCalledTimes( 1 );
			expect( spyFoo ).not.toHaveBeenCalled();

			emitter.fire( 'foo:bar' );

			expect( spyFoo ).not.toHaveBeenCalled();
			expect( spyAbc ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).toHaveBeenCalledTimes( 2 );
			expect( spyFoo2 ).toHaveBeenCalledTimes( 2 );

			emitter.fire( 'foo' );

			expect( spyFoo ).not.toHaveBeenCalled();
			expect( spyAbc ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).toHaveBeenCalledTimes( 2 );
			expect( spyFoo2 ).toHaveBeenCalledTimes( 3 );
		} );
	} );

	describe( 'listenTo', () => {
		it( 'should properly register callbacks', () => {
			const spy = vi.fn();

			listener.listenTo( emitter, 'test', spy );

			emitter.fire( 'test' );

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should correctly listen to namespaced events', () => {
			const spyFoo = vi.fn();
			const spyBar = vi.fn();
			const spyBaz = vi.fn();

			listener.listenTo( emitter, 'foo', spyFoo );
			listener.listenTo( emitter, 'foo:bar', spyBar );
			listener.listenTo( emitter, 'foo:bar:baz', spyBaz );

			emitter.fire( 'foo:bar:baz' );

			expect( spyFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).toHaveBeenCalledTimes( 1 );
			expect( spyBaz ).toHaveBeenCalledTimes( 1 );

			emitter.fire( 'foo:bar' );

			expect( spyFoo ).toHaveBeenCalledTimes( 2 );
			expect( spyBar ).toHaveBeenCalledTimes( 2 );
			expect( spyBaz ).toHaveBeenCalledTimes( 1 );

			emitter.fire( 'foo' );

			expect( spyFoo ).toHaveBeenCalledTimes( 3 );
			expect( spyBar ).toHaveBeenCalledTimes( 2 );
			expect( spyBaz ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should use _addEventListener() on emitter object', () => {
			const emitter = {
				_addEventListener() {}
			};

			const spy = vi.spyOn( emitter, '_addEventListener' );

			const callbackFunc = () => {};
			const optionsObj = {};

			listener.listenTo( emitter, 'test', callbackFunc, optionsObj );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.contexts[ 0 ] ).toBe( emitter );
			expect( spy ).toHaveBeenCalledWith( 'test', callbackFunc, optionsObj );
		} );

		it( 'should use listener\'s _addEventListener() if emitter is not implementing it', () => {
			const emitter = {};

			const spy = vi.spyOn( listener, '_addEventListener' );

			const callbackFunc = () => {};
			const optionsObj = {};

			listener.listenTo( emitter, 'test', callbackFunc, optionsObj );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.contexts[ 0 ] ).toBe( emitter );
			expect( spy ).toHaveBeenCalledWith( 'test', callbackFunc, optionsObj );
		} );
	} );

	describe( 'stopListening', () => {
		it( 'should stop listening to given event callback', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			listener.listenTo( emitter, 'event1', spy1 );
			listener.listenTo( emitter, 'event2', spy2 );

			emitter.fire( 'event1' );
			emitter.fire( 'event2' );

			listener.stopListening( emitter, 'event1', spy1 );

			emitter.fire( 'event1' );
			emitter.fire( 'event2' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to given event', () => {
			const spy1a = vi.fn();
			const spy1b = vi.fn();
			const spy2 = vi.fn();

			listener.listenTo( emitter, 'event1', spy1a );
			listener.listenTo( emitter, 'event1', spy1b );
			listener.listenTo( emitter, 'event2', spy2 );

			emitter.fire( 'event1' );
			emitter.fire( 'event2' );

			listener.stopListening( emitter, 'event1' );

			emitter.fire( 'event1' );
			emitter.fire( 'event2' );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to all events from given emitter', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();
			const spy4 = vi.fn();

			listener.listenTo( emitter, 'event1', spy1 );
			listener.listenTo( emitter, 'event2', spy2 );
			listener.listenTo( emitter, 'foo', spy3 );
			listener.listenTo( emitter, 'foo:bar:baz', spy4 );

			emitter.fire( 'event1' );
			emitter.fire( 'event2' );
			emitter.fire( 'foo:bar:baz' );

			listener.stopListening( emitter );

			emitter.fire( 'event1' );
			emitter.fire( 'event2' );
			emitter.fire( 'foo:bar:baz' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 1 );
			expect( spy4 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should stop listening to everything', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();
			const spy4 = vi.fn();

			const emitter1 = getEmitterInstance();
			const emitter2 = getEmitterInstance();

			listener.listenTo( emitter1, 'event1', spy1 );
			listener.listenTo( emitter2, 'event2', spy2 );
			listener.listenTo( emitter1, 'foo', spy3 );
			listener.listenTo( emitter1, 'foo:bar:baz', spy4 );

			emitter1.fire( 'event1' );
			emitter2.fire( 'event2' );
			emitter1.fire( 'foo' );
			emitter1.fire( 'foo:bar' );
			emitter1.fire( 'foo:bar:baz' );

			listener.stopListening();

			emitter1.fire( 'event1' );
			emitter2.fire( 'event2' );
			emitter1.fire( 'foo' );
			emitter1.fire( 'foo:bar' );
			emitter1.fire( 'foo:bar:baz' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 3 );
			expect( spy4 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not stop other emitters when a non-listened emitter is provided', () => {
			const spy = vi.fn();

			const emitter1 = getEmitterInstance();
			const emitter2 = getEmitterInstance();

			listener.listenTo( emitter1, 'test', spy );

			listener.stopListening( emitter2 );

			emitter1.fire( 'test' );

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should correctly stop listening to namespaced events', () => {
			const spyFoo = vi.fn();
			const spyBar = vi.fn();
			const spyBaz = vi.fn();

			listener.listenTo( emitter, 'foo', spyFoo );
			listener.listenTo( emitter, 'foo:bar', spyBar );
			listener.listenTo( emitter, 'foo:bar:baz', spyBaz );

			listener.stopListening( emitter, 'foo' );

			emitter.fire( 'foo:bar:baz' );

			expect( spyFoo ).not.toHaveBeenCalled();
			expect( spyBar ).toHaveBeenCalledTimes( 1 );
			expect( spyBaz ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should correctly stop listening to namespaced events when removing specialised event', () => {
			const spyFoo = vi.fn();
			const spyBar = vi.fn();
			const spyBaz = vi.fn();

			listener.listenTo( emitter, 'foo', spyFoo );
			listener.listenTo( emitter, 'foo:bar', spyBar );
			listener.listenTo( emitter, 'foo:bar:baz', spyBaz );

			listener.stopListening( emitter, 'foo:bar' );

			emitter.fire( 'foo:bar:baz' );

			expect( spyFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyBar ).not.toHaveBeenCalled();
			expect( spyBaz ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not fail with unknown events', () => {
			listener.stopListening( emitter, 'foo', () => {} );
			listener.stopListening( emitter, 'foo:bar', () => {} );
			listener.stopListening( emitter, 'foo' );
			listener.stopListening( emitter, 'foo:bar' );
		} );

		it( 'should not fail with unknown emitter', () => {
			listener.listenTo( emitter, 'foo:bar', () => {} );

			listener.stopListening( {}, 'foo', () => {} );
			listener.stopListening( {}, 'foo:bar', () => {} );
			listener.stopListening( {}, 'foo' );
			listener.stopListening( {}, 'foo:bar' );
			listener.stopListening( {} );
		} );

		it( 'should not fail with unknown callbacks', () => {
			const spy = vi.fn();

			listener.listenTo( emitter, 'foo', spy );
			listener.stopListening( emitter, 'foo', () => {} );

			emitter.fire( 'foo' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should use _removeEventListener() on emitter object', () => {
			const emitter = {
				_removeEventListener() {}
			};

			const spy = vi.spyOn( emitter, '_removeEventListener' );

			const callbackFunc = () => {};

			listener.listenTo( emitter, 'test', callbackFunc );
			listener.stopListening( emitter, 'test', callbackFunc );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.contexts[ 0 ] ).toBe( emitter );
			expect( spy ).toHaveBeenCalledWith( 'test', callbackFunc );
		} );

		it( 'should use listener\'s _removeEventListener() if emitter is not implementing it', () => {
			const emitter = {};

			const spy = vi.spyOn( listener, '_removeEventListener' );

			const callbackFunc = () => {};

			listener.listenTo( emitter, 'test', callbackFunc );
			listener.stopListening( emitter, 'test', callbackFunc );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.contexts[ 0 ] ).toBe( emitter );
			expect( spy ).toHaveBeenCalledWith( 'test', callbackFunc );
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
			it( 'forwards an event to another emitter', () => {
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
				} );

				emitterB.fire( 'foo', dataA, dataB );
			} );

			it( 'forwards multiple events to another emitter', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyFoo = vi.fn();
				const spyBar = vi.fn();
				const spyBaz = vi.fn();
				const dataA = {};
				const dataB = {};

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA );

				emitterA.on( 'foo', spyFoo );
				emitterA.on( 'bar', spyBar );
				emitterA.on( 'baz', spyBaz );

				emitterB.fire( 'foo', dataA, dataB );

				expect( spyFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyBar ).not.toHaveBeenCalled();
				expect( spyBaz ).not.toHaveBeenCalled();

				assertDelegated( spyFoo.mock.calls[ 0 ], {
					expectedSource: emitterB,
					expectedName: 'foo',
					expectedPath: [ emitterB, emitterA ],
					expectedData: [ dataA, dataB ]
				} );

				emitterB.fire( 'bar' );

				expect( spyFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyBar ).toHaveBeenCalledTimes( 1 );
				expect( spyBaz ).not.toHaveBeenCalled();

				assertDelegated( spyBar.mock.calls[ 0 ], {
					expectedSource: emitterB,
					expectedName: 'bar',
					expectedPath: [ emitterB, emitterA ],
					expectedData: []
				} );

				emitterB.fire( 'baz' );

				expect( spyFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyBar ).toHaveBeenCalledTimes( 1 );
				expect( spyBaz ).toHaveBeenCalledTimes( 1 );

				assertDelegated( spyBaz.mock.calls[ 0 ], {
					expectedSource: emitterB,
					expectedName: 'baz',
					expectedPath: [ emitterB, emitterA ],
					expectedData: []
				} );

				emitterB.fire( 'not-delegated' );

				expect( spyFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyBar ).toHaveBeenCalledTimes( 1 );
				expect( spyBaz ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'does not forward events which are not supposed to be delegated', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyFoo = vi.fn();
				const spyBar = vi.fn();
				const spyBaz = vi.fn();

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA );

				emitterA.on( 'foo', spyFoo );
				emitterA.on( 'bar', spyBar );
				emitterA.on( 'baz', spyBaz );

				emitterB.fire( 'foo' );
				emitterB.fire( 'bar' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'not-delegated' );

				expectCallOrder( spyFoo, spyBar, spyBaz );
				expect( spyFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyBar ).toHaveBeenCalledTimes( 1 );
				expect( spyBaz ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'supports deep chain event delegation', () => {
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
				} );

				emitterC.fire( 'foo', data );
			} );

			it( 'preserves path in event delegation', () => {
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
				} );

				emitterB.fire( 'foo', data );
				emitterC.fire( 'foo', data );
			} );

			it( 'executes callbacks first, then delegates further', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyA = vi.fn();
				const spyB = vi.fn();

				emitterB.delegate( 'foo' ).to( emitterA );

				emitterA.on( 'foo', spyA );
				emitterB.on( 'foo', spyB );

				emitterB.fire( 'foo' );

				expectCallOrder( spyB, spyA );
			} );

			it( 'supports delegation under a different name', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const emitterC = getEmitterInstance();
				const emitterD = getEmitterInstance();
				const spyAFoo = vi.fn();
				const spyABar = vi.fn();
				const spyCBaz = vi.fn();
				const spyDFoo = vi.fn();

				emitterB.delegate( 'foo' ).to( emitterA, 'bar' );
				emitterB.delegate( 'foo' ).to( emitterC, name => name + '-baz' );
				emitterB.delegate( 'foo' ).to( emitterD );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterC.on( 'foo-baz', spyCBaz );
				emitterD.on( 'foo', spyDFoo );

				emitterB.fire( 'foo' );

				expect( spyABar ).toHaveBeenCalledTimes( 1 );
				expect( spyCBaz ).toHaveBeenCalledTimes( 1 );
				expect( spyDFoo ).toHaveBeenCalledTimes( 1 );
				expect( spyAFoo ).not.toHaveBeenCalled();
			} );

			it( 'supports delegation under a different name with multiple events', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = vi.fn();
				const spyABar = vi.fn();
				const spyABaz = vi.fn();
				const spyAQux = vi.fn();

				emitterB.delegate( 'foo', 'bar', 'baz' ).to( emitterA, 'qux' );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterA.on( 'baz', spyABaz );
				emitterA.on( 'qux', spyAQux );

				emitterB.fire( 'foo' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'bar' );

				expect( spyAFoo ).not.toHaveBeenCalled();
				expect( spyABar ).not.toHaveBeenCalled();
				expect( spyABaz ).not.toHaveBeenCalled();

				expect( spyAQux ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'supports delegation with multiple events, each under a different name', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = vi.fn();
				const spyABar = vi.fn();
				const spyABaz = vi.fn();
				const spyAFooQux = vi.fn();
				const spyABarQux = vi.fn();
				const spyABazQux = vi.fn();

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

				expect( spyAFoo ).not.toHaveBeenCalled();
				expect( spyABar ).not.toHaveBeenCalled();
				expect( spyABaz ).not.toHaveBeenCalled();

				expect( spyAFooQux ).toHaveBeenCalledTimes( 1 );
				expect( spyABarQux ).toHaveBeenCalledTimes( 1 );
				expect( spyABazQux ).toHaveBeenCalledTimes( 1 );

				expectCallOrder( spyAFooQux, spyABazQux, spyABarQux );
			} );

			it( 'preserves path in delegation under a different name', () => {
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
				} );

				emitterB.fire( 'foo', data );
			} );

			it( 'supports delegation of all events', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = vi.fn();
				const spyABar = vi.fn();
				const spyABaz = vi.fn();

				emitterB.delegate( '*' ).to( emitterA );

				emitterA.on( 'foo', spyAFoo );
				emitterA.on( 'bar', spyABar );
				emitterA.on( 'baz', spyABaz );

				emitterB.fire( 'foo' );
				emitterB.fire( 'baz' );
				emitterB.fire( 'bar' );

				expectCallOrder( spyAFoo, spyABaz, spyABar );
			} );

			it( 'supports delegation of all events under different names', () => {
				const emitterA = getEmitterInstance();
				const emitterB = getEmitterInstance();
				const spyAFoo = vi.fn();
				const spyABar = vi.fn();
				const spyABaz = vi.fn();
				const spyAFooDel = vi.fn();
				const spyABarDel = vi.fn();
				const spyABazDel = vi.fn();

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

				expect( spyAFoo ).not.toHaveBeenCalled();
				expect( spyABar ).not.toHaveBeenCalled();
				expect( spyABaz ).not.toHaveBeenCalled();

				expectCallOrder( spyAFooDel, spyABazDel, spyABarDel );
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
			const spyFoo = vi.fn();
			const spyBar = vi.fn();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'bar' ).to( emitterC );

			emitterB.on( 'foo', spyFoo );
			emitterC.on( 'bar', spyBar );

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			expectCallOrder( spyFoo, spyBar );

			emitterA.stopDelegating();

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			expectCallOrder( spyFoo, spyBar );
		} );

		it( 'stops delegating a specific event to all emitters', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyFooB = vi.fn();
			const spyFooC = vi.fn();
			const spyBarC = vi.fn();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'foo' ).to( emitterC );
			emitterA.delegate( 'bar' ).to( emitterC );

			emitterB.on( 'foo', spyFooB );
			emitterC.on( 'foo', spyFooC );
			emitterC.on( 'bar', spyBarC );

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			expectCallOrder( spyFooB, spyFooC, spyBarC );

			emitterA.stopDelegating( 'foo' );

			emitterA.fire( 'foo' );
			emitterA.fire( 'bar' );

			expectCallOrder( spyFooB, spyFooC, spyBarC, spyBarC );
		} );

		it( 'stops delegating a specific event to a specific emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyFooB = vi.fn();
			const spyFooC = vi.fn();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'foo' ).to( emitterC );

			emitterB.on( 'foo', spyFooB );
			emitterC.on( 'foo', spyFooC );

			emitterA.fire( 'foo' );

			expectCallOrder( spyFooB, spyFooC );

			emitterA.stopDelegating( 'foo', emitterC );
			emitterA.fire( 'foo' );

			expectCallOrder( spyFooB, spyFooC, spyFooB );
		} );

		it( 'stops delegating a specific event under a different name to a specific emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyFooB = vi.fn();
			const spyFooC = vi.fn();

			emitterA.delegate( 'foo' ).to( emitterB );
			emitterA.delegate( 'foo' ).to( emitterC, 'bar' );

			emitterB.on( 'foo', spyFooB );
			emitterC.on( 'bar', spyFooC );

			emitterA.fire( 'foo' );

			expectCallOrder( spyFooB, spyFooC );

			emitterA.stopDelegating( 'foo', emitterC );
			emitterA.fire( 'foo' );

			expectCallOrder( spyFooB, spyFooC, spyFooB );
		} );

		it( 'stops delegating all ("*")', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyAFoo = vi.fn();
			const spyABar = vi.fn();
			const spyCFoo = vi.fn();
			const spyCBar = vi.fn();

			emitterB.delegate( '*' ).to( emitterA );
			emitterB.delegate( '*' ).to( emitterC );

			emitterA.on( 'foo', spyAFoo );
			emitterA.on( 'bar', spyABar );
			emitterC.on( 'foo', spyCFoo );
			emitterC.on( 'bar', spyCBar );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			expect( spyAFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyABar ).toHaveBeenCalledTimes( 1 );
			expect( spyCFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyCBar ).toHaveBeenCalledTimes( 1 );

			emitterB.stopDelegating( '*' );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			expect( spyAFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyABar ).toHaveBeenCalledTimes( 1 );
			expect( spyCFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyCBar ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'stops delegating all ("*") to a specific emitter', () => {
			const emitterA = getEmitterInstance();
			const emitterB = getEmitterInstance();
			const emitterC = getEmitterInstance();
			const spyAFoo = vi.fn();
			const spyABar = vi.fn();
			const spyCFoo = vi.fn();
			const spyCBar = vi.fn();

			emitterB.delegate( '*' ).to( emitterA );
			emitterB.delegate( 'foo' ).to( emitterC );

			emitterA.on( 'foo', spyAFoo );
			emitterA.on( 'bar', spyABar );
			emitterC.on( 'foo', spyCFoo );
			emitterC.on( 'bar', spyCBar );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			expect( spyAFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyABar ).toHaveBeenCalledTimes( 1 );
			expect( spyCFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyCBar ).not.toHaveBeenCalled();

			emitterB.stopDelegating( '*', emitterA );

			emitterB.fire( 'foo' );
			emitterB.fire( 'bar' );

			expect( spyAFoo ).toHaveBeenCalledTimes( 1 );
			expect( spyABar ).toHaveBeenCalledTimes( 1 );
			expect( spyCFoo ).toHaveBeenCalledTimes( 2 );
			expect( spyCBar ).not.toHaveBeenCalled();
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
	class BrandNewClass {}

	return new ( EmitterMixin( BrandNewClass ) )();
}

function expectCallOrder( ...spies ) {
	let previousOrder = -Infinity;

	for ( const spy of spies ) {
		const nextOrder = spy.mock.invocationCallOrder.find( callOrder => callOrder > previousOrder );

		expect( nextOrder ).toBeDefined();

		previousOrder = nextOrder;
	}
}
