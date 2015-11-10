/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'emittermixin', 'eventinfo', 'utils' );

var emitter, listener;

beforeEach( refreshEmitter );

describe( 'fire', function() {
	it( 'should execute callbacks in the right order without priority', function() {
		var spy1 = sinon.spy().named( 1 );
		var spy2 = sinon.spy().named( 2 );
		var spy3 = sinon.spy().named( 3 );

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );

		sinon.assert.callOrder( spy1, spy2, spy3 );
	} );

	it( 'should execute callbacks in the right order with priority defined', function() {
		var spy1 = sinon.spy().named( 1 );
		var spy2 = sinon.spy().named( 2 );
		var spy3 = sinon.spy().named( 3 );
		var spy4 = sinon.spy().named( 4 );
		var spy5 = sinon.spy().named( 5 );

		emitter.on( 'test', spy2, null, 9 );
		emitter.on( 'test', spy3 );	// Defaults to 10.
		emitter.on( 'test', spy4, null, 11 );
		emitter.on( 'test', spy1, null, -1 );
		emitter.on( 'test', spy5, null, 11 );

		emitter.fire( 'test' );

		sinon.assert.callOrder( spy1, spy2, spy3, spy4, spy5 );
	} );

	it( 'should pass arguments to callbacks', function() {
		var EventInfo = modules.eventinfo;

		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );

		emitter.fire( 'test', 1, 'b', true );

		sinon.assert.calledWithExactly( spy1, sinon.match.instanceOf( EventInfo ), 1, 'b', true );
		sinon.assert.calledWithExactly( spy2, sinon.match.instanceOf( EventInfo ), 1, 'b', true );
	} );

	it( 'should pass proper context to callbacks', function() {
		var ctx1 = {};
		var ctx2 = {};

		var spy1 = sinon.spy();
		var spy2 = sinon.spy();
		var spy3 = sinon.spy();

		emitter.on( 'test', spy1, ctx1 );
		emitter.on( 'test', spy2, ctx2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );

		sinon.assert.calledOn( spy1, ctx1 );
		sinon.assert.calledOn( spy2, ctx2 );
		sinon.assert.calledOn( spy3, emitter );
	} );

	it( 'should fire the right event', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		emitter.on( '1', spy1 );
		emitter.on( '2', spy2 );

		emitter.fire( '2' );

		sinon.assert.notCalled( spy1 );
		sinon.assert.called( spy2 );
	} );

	it( 'should execute callbacks many times', function() {
		var spy = sinon.spy();

		emitter.on( 'test', spy );

		emitter.fire( 'test' );
		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledThrice( spy );
	} );

	it( 'should do nothing for a non listened event', function() {
		emitter.fire( 'test' );
	} );

	it( 'should accept the same callback many times', function() {
		var spy = sinon.spy();

		emitter.on( 'test', spy );
		emitter.on( 'test', spy );
		emitter.on( 'test', spy );

		emitter.fire( 'test' );

		sinon.assert.calledThrice( spy );
	} );
} );

describe( 'on', function() {
	it( 'should stop()', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();
		var spy3 = sinon.spy( function( event ) {
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

	it( 'should take a callback off()', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy( function( event ) {
			event.off();
		} );
		var spy3 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledTwice( spy1 );
		sinon.assert.calledOnce( spy2 );
		sinon.assert.calledTwice( spy3 );
	} );

	it( 'should take the callback off() even after stop()', function() {
		var spy1 = sinon.spy( function( event ) {
			event.stop();
			event.off();
		} );
		var spy2 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.on( 'test', spy2 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledOnce( spy2 );
	} );
} );

describe( 'once', function() {
	it( 'should be called just once', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();
		var spy3 = sinon.spy();

		emitter.on( 'test', spy1 );
		emitter.once( 'test', spy2 );
		emitter.on( 'test', spy3 );

		emitter.fire( 'test' );
		emitter.fire( 'test' );

		sinon.assert.calledTwice( spy1 );
		sinon.assert.calledOnce( spy2 );
		sinon.assert.calledTwice( spy3 );
	} );

	it( 'should have proper scope', function() {
		var ctx = {};

		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		emitter.once( 'test', spy1, ctx );
		emitter.once( 'test', spy2 );

		emitter.fire( 'test' );

		sinon.assert.calledOn( spy1, ctx );
		sinon.assert.calledOn( spy2, emitter );
	} );

	it( 'should have proper arguments', function() {
		var EventInfo = modules.eventinfo;

		var spy = sinon.spy();

		emitter.once( 'test', spy );

		emitter.fire( 'test', 1, 2, 3 );

		sinon.assert.calledWithExactly( spy, sinon.match.instanceOf( EventInfo ), 1, 2, 3 );
	} );
} );

describe( 'off', function() {
	it( 'should get callbacks off()', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();
		var spy3 = sinon.spy();

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

	it( 'should not fail with unknown events', function() {
		emitter.off( 'test', function() {} );
	} );

	it( 'should remove all entries for the same callback', function() {
		var spy1 = sinon.spy().named( 1 );
		var spy2 = sinon.spy().named( 2 );

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

	it( 'should remove the callback for a specific context only', function() {
		var spy = sinon.spy().named( 1 );

		var ctx1 = { ctx: 1 };
		var ctx2 = { ctx: 2 };

		emitter.on( 'test', spy, ctx1 );
		emitter.on( 'test', spy, ctx2 );

		emitter.fire( 'test' );

		spy.reset();

		emitter.off( 'test', spy, ctx1 );

		emitter.fire( 'test' );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledOn( spy, ctx2 );
	} );
} );

describe( 'listenTo', function() {
	beforeEach( refreshListener );

	it( 'should properly register callbacks', function() {
		var spy = sinon.spy();

		listener.listenTo( emitter, 'test', spy );

		emitter.fire( 'test' );

		sinon.assert.called( spy );
	} );
} );

describe( 'stopListening', function() {
	beforeEach( refreshListener );

	it( 'should stop listening to a specific event callback', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

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

	it( 'should stop listening to an specific event', function() {
		var spy1a = sinon.spy();
		var spy1b = sinon.spy();
		var spy2 = sinon.spy();

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

	it( 'should stop listening to all events from a specific emitter', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

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

	it( 'should stop listening to everything', function() {
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		var emitter1 = getEmitterInstance();
		var emitter2 = getEmitterInstance();

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

	it( 'should not stop other emitters when a non-listened emitter is provided', function() {
		var spy = sinon.spy();

		var emitter1 = getEmitterInstance();
		var emitter2 = getEmitterInstance();

		listener.listenTo( emitter1, 'test', spy );

		listener.stopListening( emitter2 );

		emitter1.fire( 'test' );

		sinon.assert.called( spy );
	} );
} );

function refreshEmitter() {
	emitter = getEmitterInstance();
}

function refreshListener() {
	listener = getEmitterInstance();
}

function getEmitterInstance() {
	var EmitterMixin = modules.emittermixin;
	var utils = modules.utils;

	return utils.extend( {}, EmitterMixin );
}
