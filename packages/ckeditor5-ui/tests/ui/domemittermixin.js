/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, Event, MouseEvent */
/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'utils', 'ui/domemittermixin', 'ui/view', 'emittermixin' );
var emitter, view, node;

bender.tools.createSinonSandbox();

var getEmitterInstance = () => modules.utils.extend( {}, modules.emittermixin );
var getViewInstance = () => new modules[ 'ui/view' ]();
var getDOMNodeInstance = () => document.createElement( 'div' );

function updateEmitterMixinInstance() {
	emitter = getEmitterInstance();
}

function updateViewInstance() {
	view = getViewInstance();
}

function updateDOMNodeInstance() {
	node = getDOMNodeInstance();
}

beforeEach( updateEmitterMixinInstance );
beforeEach( updateViewInstance );
beforeEach( updateDOMNodeInstance );

describe( 'listenTo', function() {
	it( 'should listen to EmitterMixin events', function() {
		var spy = bender.sinon.spy();

		view.listenTo( emitter, 'test', spy );
		emitter.fire( 'test' );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should listen to native DOM events', function() {
		var spy = bender.sinon.spy();

		view.listenTo( node, 'test', spy );

		var event = new Event( 'test' );
		node.dispatchEvent( event );

		sinon.assert.calledOnce( spy );
	} );
} );

describe( 'stopListening', function() {
	it( 'should stop listening to a specific event callback', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();

		view.listenTo( node, 'event1', spy1 );
		view.listenTo( node, 'event2', spy2 );

		node.dispatchEvent( new Event( 'event1' ) );
		node.dispatchEvent( new Event( 'event2' ) );

		view.stopListening( node, 'event1', spy1 );

		node.dispatchEvent( new Event( 'event1' ) );
		node.dispatchEvent( new Event( 'event2' ) );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledTwice( spy2 );
	} );

	it( 'should stop listening to an specific event', function() {
		var spy1a = bender.sinon.spy();
		var spy1b = bender.sinon.spy();
		var spy2 = bender.sinon.spy();

		view.listenTo( node, 'event1', spy1a );
		view.listenTo( node, 'event1', spy1b );
		view.listenTo( node, 'event2', spy2 );

		node.dispatchEvent( new Event( 'event1' ) );
		node.dispatchEvent( new Event( 'event2' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledOnce( spy2 );

		view.stopListening( node, 'event1' );

		node.dispatchEvent( new Event( 'event1' ) );
		node.dispatchEvent( new Event( 'event2' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );
	} );

	it( 'should stop listening to all events from a specific node', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();

		view.listenTo( node, 'event1', spy1 );
		view.listenTo( node, 'event2', spy2 );

		node.dispatchEvent( new Event( 'event1' ) );
		node.dispatchEvent( new Event( 'event2' ) );

		view.stopListening( node );

		node.dispatchEvent( new Event( 'event1' ) );
		node.dispatchEvent( new Event( 'event2' ) );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledOnce( spy2 );
	} );

	it( 'should stop listening to everything', function() {
		var spy1 = bender.sinon.spy();
		var spy2 = bender.sinon.spy();

		var node1 = getDOMNodeInstance();
		var node2 = getDOMNodeInstance();

		view.listenTo( node1, 'event1', spy1 );
		view.listenTo( node2, 'event2', spy2 );

		expect( view ).to.have.property( '_listeningTo' );

		node1.dispatchEvent( new Event( 'event1' ) );
		node2.dispatchEvent( new Event( 'event2' ) );

		view.stopListening();

		node1.dispatchEvent( new Event( 'event1' ) );
		node2.dispatchEvent( new Event( 'event2' ) );

		sinon.assert.calledOnce( spy1 );
		sinon.assert.calledOnce( spy2 );

		expect( view ).to.not.have.property( '_listeningTo' );
	} );

	it( 'should not stop other nodes when a non-listened node is provided', function() {
		var spy = bender.sinon.spy();

		var node1 = getDOMNodeInstance();
		var node2 = getDOMNodeInstance();

		view.listenTo( node1, 'test', spy );

		view.stopListening( node2 );

		node1.dispatchEvent( new Event( 'test' ) );

		sinon.assert.called( spy );
	} );

	it( 'should pass DOM Event data to the listener', function() {
		var spy = bender.sinon.spy();

		var node = getDOMNodeInstance();

		view.listenTo( node, 'click', spy );

		var mouseEvent = new MouseEvent( 'click', {
			screenX: 10,
			screenY: 20
		} );

		node.dispatchEvent( mouseEvent );

		sinon.assert.calledOnce( spy );
		expect( spy.args[ 0 ][ 1 ] ).to.be.equal( mouseEvent );
	} );

	it( 'should detach native DOM event listener proxy, specific event', function() {
		var spy1a = bender.sinon.spy();
		var spy1b = bender.sinon.spy();

		view.listenTo( node, 'test', spy1a );

		var proxyEmitter = view._getProxyEmitter( node );
		var spy2 = bender.sinon.spy( proxyEmitter, 'fire' );

		node.dispatchEvent( new Event( 'test' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy2 );

		view.stopListening( node, 'test' );
		node.dispatchEvent( new Event( 'test' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy2 );

		// Attach same event again.
		view.listenTo( node, 'test', spy1b );
		node.dispatchEvent( new Event( 'test' ) );

		expect( proxyEmitter ).to.be.equal( view._getProxyEmitter( node ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );
	} );

	it( 'should detach native DOM event listener proxy, specific callback', function() {
		var spy1a = bender.sinon.spy();
		var spy1b = bender.sinon.spy();
		var spy1c = bender.sinon.spy();

		view.listenTo( node, 'test', spy1a );
		view.listenTo( node, 'test', spy1b );

		var proxyEmitter = view._getProxyEmitter( node );
		var spy2 = bender.sinon.spy( proxyEmitter, 'fire' );

		node.dispatchEvent( new Event( 'test' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledOnce( spy2 );

		view.stopListening( node, 'test', spy1a );
		node.dispatchEvent( new Event( 'test' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledTwice( spy1b );
		sinon.assert.calledTwice( spy2 );

		view.stopListening( node, 'test', spy1b );
		node.dispatchEvent( new Event( 'test' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledTwice( spy1b );
		sinon.assert.calledTwice( spy2 );

		// Attach same event again.
		view.listenTo( node, 'test', spy1c );
		node.dispatchEvent( new Event( 'test' ) );

		expect( proxyEmitter ).to.be.equal( view._getProxyEmitter( node ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledTwice( spy1b );
		sinon.assert.calledOnce( spy1c );
		sinon.assert.calledThrice( spy2 );
	} );

	it( 'should detach native DOM event listener proxy, specific emitter', function() {
		var spy1a = bender.sinon.spy();
		var spy1b = bender.sinon.spy();
		var spy1c = bender.sinon.spy();
		var spy1d = bender.sinon.spy();

		view.listenTo( node, 'test1', spy1a );
		view.listenTo( node, 'test2', spy1b );

		var proxyEmitter = view._getProxyEmitter( node );
		var spy2 = bender.sinon.spy( proxyEmitter, 'fire' );

		node.dispatchEvent( new Event( 'test1' ) );
		node.dispatchEvent( new Event( 'test2' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );

		view.stopListening( node );

		node.dispatchEvent( new Event( 'test1' ) );
		node.dispatchEvent( new Event( 'test2' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );

		// Attach same event again.
		view.listenTo( node, 'test1', spy1c );
		view.listenTo( node, 'test2', spy1d );

		// Old proxy emitter died when stopped listening to the node.
		var proxyEmitter2 = view._getProxyEmitter( node );
		var spy3 = bender.sinon.spy( proxyEmitter2, 'fire' );

		node.dispatchEvent( new Event( 'test1' ) );
		node.dispatchEvent( new Event( 'test2' ) );

		expect( proxyEmitter ).to.not.be.equal( proxyEmitter2 );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledOnce( spy1c );
		sinon.assert.calledOnce( spy1d );
		sinon.assert.calledTwice( spy2 );
		sinon.assert.calledTwice( spy3 );
	} );

	it( 'should detach native DOM event listener proxy, everything', function() {
		var spy1a = bender.sinon.spy();
		var spy1b = bender.sinon.spy();
		var spy1c = bender.sinon.spy();
		var spy1d = bender.sinon.spy();

		view.listenTo( node, 'test1', spy1a );
		view.listenTo( node, 'test2', spy1b );

		var proxyEmitter = view._getProxyEmitter( node );
		var spy2 = bender.sinon.spy( proxyEmitter, 'fire' );

		node.dispatchEvent( new Event( 'test1' ) );
		node.dispatchEvent( new Event( 'test2' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );

		view.stopListening();

		node.dispatchEvent( new Event( 'test1' ) );
		node.dispatchEvent( new Event( 'test2' ) );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledTwice( spy2 );

		// Attach same event again.
		view.listenTo( node, 'test1', spy1c );
		view.listenTo( node, 'test2', spy1d );

		// Old proxy emitter died when stopped listening to the node.
		var proxyEmitter2 = view._getProxyEmitter( node );
		var spy3 = bender.sinon.spy( proxyEmitter2, 'fire' );

		node.dispatchEvent( new Event( 'test1' ) );
		node.dispatchEvent( new Event( 'test2' ) );

		expect( proxyEmitter ).to.not.be.equal( proxyEmitter2 );

		sinon.assert.calledOnce( spy1a );
		sinon.assert.calledOnce( spy1b );
		sinon.assert.calledOnce( spy1c );
		sinon.assert.calledOnce( spy1d );
		sinon.assert.calledTwice( spy2 );
		sinon.assert.calledTwice( spy3 );
	} );
} );
