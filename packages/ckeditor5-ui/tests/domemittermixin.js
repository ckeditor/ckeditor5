/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, Event, MouseEvent */
/* bender-tags: ui */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import extend from '/ckeditor5/utils/lib/lodash/extend.js';
import DOMEmitterMixin from '/ckeditor5/ui/domemittermixin.js';
import EmitterMixin from '/ckeditor5/utils/emittermixin.js';

let emitter, domEmitter, node;

testUtils.createSinonSandbox();

const getEmitterInstance = () => extend( {}, EmitterMixin );
const getDOMEmitterInstance = () => extend( {}, DOMEmitterMixin );
const getDOMNodeInstance = () => document.createElement( 'div' );

function updateEmitterInstance() {
	emitter = getEmitterInstance();
}

function updateDOMEmitterInstance() {
	domEmitter = getDOMEmitterInstance();
}

function updateDOMNodeInstance() {
	node = getDOMNodeInstance();
}

describe( 'DOMEmitterMixin', () => {
	beforeEach( () => {
		updateEmitterInstance();
		updateDOMEmitterInstance();
		updateDOMNodeInstance();
	} );

	describe( 'listenTo', () => {
		it( 'should listen to EmitterMixin events', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( emitter, 'test', spy );
			emitter.fire( 'test' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should listen to native DOM events', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test', spy );

			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy );
		} );

		// #187
		it( 'should work for DOM Nodes belonging to another window', () => {
			const spy = testUtils.sinon.spy();
			const iframe = document.createElement( 'iframe' );

			document.body.appendChild( iframe );
			const iframeNode = iframe.contentWindow.document.createElement( 'div' );

			domEmitter.listenTo( iframeNode, 'test', spy );
			iframeNode.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'stopListening', () => {
		it( 'should stop listening to a specific event callback', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'event1', spy1 );
			domEmitter.listenTo( node, 'event2', spy2 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			domEmitter.stopListening( node, 'event1', spy1 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledTwice( spy2 );
		} );

		it( 'should stop listening to an specific event', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'event1', spy1a );
			domEmitter.listenTo( node, 'event1', spy1b );
			domEmitter.listenTo( node, 'event2', spy2 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy2 );

			domEmitter.stopListening( node, 'event1' );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledTwice( spy2 );
		} );

		it( 'should stop listening to all events from a specific node', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'event1', spy1 );
			domEmitter.listenTo( node, 'event2', spy2 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			domEmitter.stopListening( node );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
		} );

		it( 'should stop listening to everything', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			const node1 = getDOMNodeInstance();
			const node2 = getDOMNodeInstance();

			domEmitter.listenTo( node1, 'event1', spy1 );
			domEmitter.listenTo( node2, 'event2', spy2 );

			expect( domEmitter ).to.have.property( '_listeningTo' );

			node1.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );

			domEmitter.stopListening();

			node1.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );

			expect( domEmitter ).to.not.have.property( '_listeningTo' );
		} );

		it( 'should not stop other nodes when a non-listened node is provided', () => {
			const spy = testUtils.sinon.spy();

			const node1 = getDOMNodeInstance();
			const node2 = getDOMNodeInstance();

			domEmitter.listenTo( node1, 'test', spy );

			domEmitter.stopListening( node2 );

			node1.dispatchEvent( new Event( 'test' ) );

			sinon.assert.called( spy );
		} );

		it( 'should pass DOM Event data to the listener', () => {
			const spy = testUtils.sinon.spy();

			const node = getDOMNodeInstance();

			domEmitter.listenTo( node, 'click', spy );

			const mouseEvent = new MouseEvent( 'click', {
				screenX: 10,
				screenY: 20
			} );

			node.dispatchEvent( mouseEvent );

			sinon.assert.calledOnce( spy );
			expect( spy.args[ 0 ][ 1 ] ).to.be.equal( mouseEvent );
		} );

		it( 'should detach native DOM event listener proxy, specific event', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test', spy1a );

			const proxyEmitter = domEmitter._getProxyEmitter( node );
			const spy2 = testUtils.sinon.spy( proxyEmitter, 'fire' );

			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy2 );

			domEmitter.stopListening( node, 'test' );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy2 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test', spy1b );
			node.dispatchEvent( new Event( 'test' ) );

			expect( proxyEmitter ).to.be.equal( domEmitter._getProxyEmitter( node ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledTwice( spy2 );
		} );

		it( 'should detach native DOM event listener proxy, specific callback', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test', spy1a );
			domEmitter.listenTo( node, 'test', spy1b );

			const proxyEmitter = domEmitter._getProxyEmitter( node );
			const spy2 = testUtils.sinon.spy( proxyEmitter, 'fire' );

			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy2 );

			domEmitter.stopListening( node, 'test', spy1a );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledTwice( spy2 );

			domEmitter.stopListening( node, 'test', spy1b );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledTwice( spy2 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test', spy1c );
			node.dispatchEvent( new Event( 'test' ) );

			expect( proxyEmitter ).to.be.equal( domEmitter._getProxyEmitter( node ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledThrice( spy2 );
		} );

		it( 'should detach native DOM event listener proxy, specific emitter', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();
			const spy1d = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test1', spy1a );
			domEmitter.listenTo( node, 'test2', spy1b );

			const proxyEmitter = domEmitter._getProxyEmitter( node );
			const spy2 = testUtils.sinon.spy( proxyEmitter, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledTwice( spy2 );

			domEmitter.stopListening( node );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledTwice( spy2 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test1', spy1c );
			domEmitter.listenTo( node, 'test2', spy1d );

			// Old proxy emitter died when stopped listening to the node.
			const proxyEmitter2 = domEmitter._getProxyEmitter( node );
			const spy3 = testUtils.sinon.spy( proxyEmitter2, 'fire' );

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

		it( 'should detach native DOM event listener proxy, everything', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();
			const spy1d = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test1', spy1a );
			domEmitter.listenTo( node, 'test2', spy1b );

			const proxyEmitter = domEmitter._getProxyEmitter( node );
			const spy2 = testUtils.sinon.spy( proxyEmitter, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledTwice( spy2 );

			domEmitter.stopListening();

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledTwice( spy2 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test1', spy1c );
			domEmitter.listenTo( node, 'test2', spy1d );

			// Old proxy emitter died when stopped listening to the node.
			const proxyEmitter2 = domEmitter._getProxyEmitter( node );
			const spy3 = testUtils.sinon.spy( proxyEmitter2, 'fire' );

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

		// #187
		it( 'should work for DOM Nodes belonging to another window', () => {
			const spy = testUtils.sinon.spy();
			const iframe = document.createElement( 'iframe' );

			document.body.appendChild( iframe );
			const iframeNode = iframe.contentWindow.document.createElement( 'div' );

			domEmitter.listenTo( iframeNode, 'test', spy );

			iframeNode.dispatchEvent( new Event( 'test' ) );
			domEmitter.stopListening( iframeNode );
			iframeNode.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
