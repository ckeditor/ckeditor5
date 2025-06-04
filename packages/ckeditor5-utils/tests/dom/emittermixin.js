/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import DomEmitterMixin from '../../src/dom/emittermixin.js';
import EmitterMixin from '../../src/emittermixin.js';

describe( 'DomEmitterMixin', () => {
	const Emitter = EmitterMixin();
	const DomEmitter = DomEmitterMixin();

	let emitter, domEmitter, node;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		emitter = new Emitter();
		domEmitter = new DomEmitter();
		node = document.createElement( 'div' );
	} );

	afterEach( () => {
		domEmitter.stopListening();
	} );

	it( 'mixes in EmitterMixin', () => {
		expect( new DomEmitter() ).to.have.property( 'on', Emitter.prototype.on );
	} );

	it( 'inherits any emitter directly', () => {
		class TestClass {
			constructor( value ) {
				this.value = value;
			}
		}

		const EmitterClass = EmitterMixin( TestClass );
		const ObservableClass = DomEmitterMixin( EmitterClass );

		const observable = new ObservableClass( 5 );

		expect( observable ).to.be.instanceOf( TestClass );
		expect( observable.value ).to.equal( 5 );
	} );

	it( 'inherits any emitter indirectly', () => {
		class TestClass extends Emitter {
			constructor( value ) {
				super();

				this.value = value;
			}
		}

		const ObservableClass = DomEmitterMixin( TestClass );

		const observable = new ObservableClass( 5 );

		expect( observable ).to.be.instanceOf( TestClass );
		expect( observable.value ).to.equal( 5 );
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

		it( 'should listen to native DOM events - window as source', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( window, 'test', spy );

			window.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should listen to native DOM events - document as source', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( document, 'test', spy );

			document.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should listen to native DOM events - VisualViewport (EventTarget) as source', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( window.visualViewport, 'test', spy );

			window.visualViewport.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy );
		} );

		// #187
		it( 'should work for DOM Nodes belonging to another window', done => {
			const spy = testUtils.sinon.spy();
			const iframe = document.createElement( 'iframe' );

			iframe.addEventListener( 'load', () => {
				const iframeNode = iframe.contentWindow.document.createElement( 'div' );

				domEmitter.listenTo( iframeNode, 'test', spy );
				iframeNode.dispatchEvent( new Event( 'test' ) );

				sinon.assert.calledOnce( spy );

				iframe.remove();
				done();
			} );

			document.body.appendChild( iframe );
		} );

		describe( 'event capturing', () => {
			beforeEach( () => {
				document.body.appendChild( node );
			} );

			afterEach( () => {
				document.body.removeChild( node );
			} );

			it( 'should not use capturing at default', () => {
				const spy = testUtils.sinon.spy();

				domEmitter.listenTo( document, 'test', spy );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );

				sinon.assert.notCalled( spy );
			} );

			it( 'should optionally use capturing', () => {
				const spy = testUtils.sinon.spy();

				domEmitter.listenTo( document, 'test', spy, { useCapture: true } );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should optionally use capturing if already listening', () => {
				const spy1 = testUtils.sinon.spy();
				const spy2 = testUtils.sinon.spy();

				domEmitter.listenTo( document, 'test', spy1 );
				domEmitter.listenTo( document, 'test', spy2, { useCapture: true } );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );

				sinon.assert.notCalled( spy1 );
				sinon.assert.calledOnce( spy2 );
			} );
		} );

		describe( 'event passive handling', () => {
			it( 'should not use passive mode by default', () => {
				const spy = sinon.spy( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {} );

				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: false, passive: false } ) ) ).to.be.true;
			} );

			it( 'should optionally use passive mode', () => {
				const spy = sinon.spy( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {}, { usePassive: true } );

				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: false, passive: true } ) ) ).to.be.true;
			} );

			it( 'should not get activated for event capturing (if not desired)', () => {
				const spy = sinon.spy( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {}, { useCapture: true } );

				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: true, passive: false } ) ) ).to.be.true;
			} );

			it( 'should optionally use passive mode if already listening', () => {
				const spy = sinon.spy( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {} );
				domEmitter.listenTo( node, 'test', () => {}, { usePassive: true } );
				domEmitter.listenTo( node, 'test', () => {}, { useCapture: true } );
				domEmitter.listenTo( node, 'test', () => {}, { useCapture: true, usePassive: true } );

				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: false, passive: false } ) ) ).to.be.true;
				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: false, passive: true } ) ) ).to.be.true;
				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: true, passive: false } ) ) ).to.be.true;
				expect( spy.calledWith( 'test', sinon.match.func, sinon.match( { capture: true, passive: true } ) ) ).to.be.true;
			} );
		} );
	} );

	describe( 'stopListening', () => {
		it( 'should stop listening to EmitterMixin events, specific event', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			domEmitter.listenTo( emitter, 'foo', spy1 );
			domEmitter.listenTo( emitter, 'foo:bar', spy2 );

			emitter.fire( 'foo:bar' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );

			domEmitter.stopListening( emitter, 'foo' );

			emitter.fire( 'foo:bar' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledTwice( spy2 );
		} );

		it( 'should stop listening to EmitterMixin events, specific emitter', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			domEmitter.listenTo( emitter, 'foo', spy1 );
			domEmitter.listenTo( emitter, 'foo:bar', spy2 );

			emitter.fire( 'foo:bar' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );

			domEmitter.stopListening( emitter );

			emitter.fire( 'foo:bar' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
		} );

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

		it( 'should stop listening to a specific event callback (only from the given node)', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'event1', spy1 );
			domEmitter.listenTo( node1, 'event2', spy2 );
			domEmitter.listenTo( node2, 'event1', spy1 );

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );

			sinon.assert.calledTwice( spy1 );
			sinon.assert.calledOnce( spy2 );

			domEmitter.stopListening( node1, 'event1', spy1 );

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );

			sinon.assert.calledThrice( spy1 );
			sinon.assert.calledTwice( spy2 );
		} );

		it( 'should stop listening to a specific event callback (re–listen)', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'event', spy );
			node.dispatchEvent( new Event( 'event' ) );
			domEmitter.stopListening( node, 'event', spy );

			domEmitter.listenTo( node, 'event', spy );
			node.dispatchEvent( new Event( 'event' ) );
			sinon.assert.calledTwice( spy );
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

		it( 'should stop listening to all events from a specific node (only that node)', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'event', spy1 );
			domEmitter.listenTo( node2, 'event', spy2 );

			node1.dispatchEvent( new Event( 'event' ) );
			node2.dispatchEvent( new Event( 'event' ) );

			domEmitter.stopListening( node1 );

			node1.dispatchEvent( new Event( 'event' ) );
			node2.dispatchEvent( new Event( 'event' ) );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledTwice( spy2 );
		} );

		it( 'should stop listening to all events from a VisualViewport (EventTarget)', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( window.visualViewport, 'event', spy );

			window.visualViewport.dispatchEvent( new Event( 'event' ) );

			domEmitter.stopListening( window.visualViewport );

			window.visualViewport.dispatchEvent( new Event( 'event' ) );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should stop listening to everything', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();
			const spy3 = testUtils.sinon.spy();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'event1', spy1 );
			domEmitter.listenTo( node2, 'event2', spy2 );
			domEmitter.listenTo( emitter, 'event3', spy3 );

			node1.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );
			emitter.fire( 'event3' );

			domEmitter.stopListening();

			node1.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );
			emitter.fire( 'event3' );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
			sinon.assert.calledOnce( spy3 );
		} );

		it( 'should stop listening to everything what left', () => {
			const spy1 = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();
			const spy3 = testUtils.sinon.spy();
			const spy4 = testUtils.sinon.spy();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'event1', spy1 );
			domEmitter.listenTo( node1, 'event2', spy2 );
			domEmitter.listenTo( node2, 'event1', spy3 );
			domEmitter.listenTo( node2, 'event2', spy4 );

			domEmitter.stopListening( node1, 'event1', spy1 );
			domEmitter.stopListening( node2, 'event1' );

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.notCalled( spy1 );
			sinon.assert.calledOnce( spy2 );
			sinon.assert.notCalled( spy3 );
			sinon.assert.calledOnce( spy4 );

			domEmitter.stopListening();

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );

			sinon.assert.notCalled( spy1 );
			sinon.assert.calledOnce( spy2 );
			sinon.assert.notCalled( spy3 );
			sinon.assert.calledOnce( spy4 );
		} );

		it( 'should not stop other nodes when a non-listened node is provided', () => {
			const spy = testUtils.sinon.spy();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'test', spy );

			domEmitter.stopListening( node2 );

			node1.dispatchEvent( new Event( 'test' ) );

			sinon.assert.called( spy );
		} );

		it( 'should pass DOM Event data to the listener', () => {
			const spy = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'click', spy );

			const mouseEvent = new MouseEvent( 'click', {
				screenX: 10,
				screenY: 20
			} );

			node.dispatchEvent( mouseEvent );

			sinon.assert.calledOnce( spy );
			expect( spy.args[ 0 ][ 1 ] ).to.equal( mouseEvent );
		} );

		it( 'should detach native DOM event listener proxy, specific event', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();
			const spy2a = testUtils.sinon.spy();
			const spy2b = testUtils.sinon.spy();
			const spy2c = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test', spy1a );
			domEmitter.listenTo( node, 'test', spy1b, { useCapture: true } );
			domEmitter.listenTo( node, 'test', spy1c, { usePassive: true } );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { capture: false, passive: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { capture: true, passive: false } );
			const proxyEmitterC = domEmitter._getProxyEmitter( node, { capture: false, passive: true } );
			const spyFireA = testUtils.sinon.spy( proxyEmitterA, 'fire' );
			const spyFireB = testUtils.sinon.spy( proxyEmitterB, 'fire' );
			const spyFireC = testUtils.sinon.spy( proxyEmitterC, 'fire' );

			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledOnce( spyFireA );
			sinon.assert.calledOnce( spyFireB );
			sinon.assert.calledOnce( spyFireC );

			domEmitter.stopListening( node, 'test' );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spyFireA );

			// Attach same event again.
			domEmitter.listenTo( node, 'test', spy2a );
			domEmitter.listenTo( node, 'test', spy2b, { useCapture: true } );
			domEmitter.listenTo( node, 'test', spy2c, { usePassive: true } );

			node.dispatchEvent( new Event( 'test' ) );

			expect( proxyEmitterA ).to.equal( domEmitter._getProxyEmitter( node, { capture: false, passive: false } ) );
			expect( proxyEmitterB ).to.equal( domEmitter._getProxyEmitter( node, { capture: true, passive: false } ) );
			expect( proxyEmitterC ).to.equal( domEmitter._getProxyEmitter( node, { capture: false, passive: true } ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledOnce( spy2a );
			sinon.assert.calledOnce( spy2b );
			sinon.assert.calledOnce( spy2c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledTwice( spyFireB );
			sinon.assert.calledTwice( spyFireC );
		} );

		it( 'should detach native DOM event listener proxy, specific callback', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();
			const spy2 = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test', spy1a );
			domEmitter.listenTo( node, 'test', spy1b );
			domEmitter.listenTo( node, 'test', spy1c, { useCapture: true } );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { capture: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { capture: true } );
			const spyFireA = testUtils.sinon.spy( proxyEmitterA, 'fire' );
			const spyFireB = testUtils.sinon.spy( proxyEmitterB, 'fire' );

			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledOnce( spyFireA );
			sinon.assert.calledOnce( spyFireB );

			domEmitter.stopListening( node, 'test', spy1a );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledTwice( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledTwice( spyFireB );

			domEmitter.stopListening( node, 'test', spy1b );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledThrice( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledThrice( spyFireB );

			domEmitter.stopListening( node, 'test', spy1c );
			node.dispatchEvent( new Event( 'test' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledThrice( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledThrice( spyFireB );

			// Attach same event again.
			domEmitter.listenTo( node, 'test', spy2 );
			node.dispatchEvent( new Event( 'test' ) );

			expect( proxyEmitterA ).to.equal( domEmitter._getProxyEmitter( node, { capture: false } ) );
			expect( proxyEmitterB ).to.equal( domEmitter._getProxyEmitter( node, { capture: true } ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledTwice( spy1b );
			sinon.assert.calledThrice( spy1c );
			sinon.assert.calledOnce( spy2 );
			sinon.assert.calledThrice( spyFireA );
			sinon.assert.calledThrice( spyFireB );
		} );

		it( 'should detach native DOM event listener proxy, specific emitter', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();
			const spy2a = testUtils.sinon.spy();
			const spy2b = testUtils.sinon.spy();
			const spy2c = testUtils.sinon.spy();

			domEmitter.listenTo( node, 'test1', spy1a );
			domEmitter.listenTo( node, 'test2', spy1b );
			domEmitter.listenTo( node, 'test2', spy1c, { usePassive: true } );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { passive: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { passive: true } );
			const spyFireA = testUtils.sinon.spy( proxyEmitterA, 'fire' );
			const spyFireB = testUtils.sinon.spy( proxyEmitterB, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledOnce( spyFireB );

			domEmitter.stopListening( node );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledOnce( spyFireB );

			// Attach same event again.
			domEmitter.listenTo( node, 'test1', spy2a );
			domEmitter.listenTo( node, 'test2', spy2b );
			domEmitter.listenTo( node, 'test2', spy2c, { usePassive: true } );

			// Old proxy emitter died when stopped listening to the node.
			const proxyEmitter2a = domEmitter._getProxyEmitter( node, { passive: false } );
			const proxyEmitter2b = domEmitter._getProxyEmitter( node, { passive: true } );
			const spyFire2a = testUtils.sinon.spy( proxyEmitter2a, 'fire' );
			const spyFire2b = testUtils.sinon.spy( proxyEmitter2b, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			expect( proxyEmitterA ).to.not.be.equal( proxyEmitter2a );
			expect( proxyEmitterB ).to.not.be.equal( proxyEmitter2b );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledOnce( spyFireB );
			sinon.assert.calledOnce( spy2a );
			sinon.assert.calledOnce( spy2b );
			sinon.assert.calledOnce( spy2c );
			sinon.assert.calledTwice( spyFire2a );
			sinon.assert.calledOnce( spyFire2b );
		} );

		it( 'should detach native DOM event listener proxy, everything', () => {
			const spy1a = testUtils.sinon.spy();
			const spy1b = testUtils.sinon.spy();
			const spy1c = testUtils.sinon.spy();
			const spy2a = testUtils.sinon.spy();
			const spy2b = testUtils.sinon.spy();
			const spy2c = testUtils.sinon.spy();
			const spyEl2 = testUtils.sinon.spy();
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node, 'test1', spy1a );
			domEmitter.listenTo( node, 'test2', spy1b );
			domEmitter.listenTo( node, 'test1', spy1c, { useCapture: true } );
			domEmitter.listenTo( node2, 'test1', spyEl2 );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { capture: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { capture: true } );
			const spyFireA = testUtils.sinon.spy( proxyEmitterA, 'fire' );
			const spyFireB = testUtils.sinon.spy( proxyEmitterB, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );
			node2.dispatchEvent( new Event( 'test1' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledOnce( spyFireB );
			sinon.assert.calledOnce( spyEl2 );

			domEmitter.stopListening();

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );
			node2.dispatchEvent( new Event( 'test1' ) );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledOnce( spyFireB );
			sinon.assert.calledOnce( spyEl2 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test1', spy2a );
			domEmitter.listenTo( node, 'test2', spy2b );
			domEmitter.listenTo( node, 'test2', spy2c, { useCapture: true } );

			// Old proxy emitter died when stopped listening to the node.
			const proxyEmitter2a = domEmitter._getProxyEmitter( node, { capture: false } );
			const proxyEmitter2b = domEmitter._getProxyEmitter( node, { capture: true } );
			const spyFire2a = testUtils.sinon.spy( proxyEmitter2a, 'fire' );
			const spyFire2b = testUtils.sinon.spy( proxyEmitter2b, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			expect( proxyEmitterA ).to.not.be.equal( proxyEmitter2a );
			expect( proxyEmitterB ).to.not.be.equal( proxyEmitter2b );

			sinon.assert.calledOnce( spy1a );
			sinon.assert.calledOnce( spy1b );
			sinon.assert.calledOnce( spy1c );
			sinon.assert.calledTwice( spyFireA );
			sinon.assert.calledOnce( spyFireB );
			sinon.assert.calledOnce( spyEl2 );
			sinon.assert.calledOnce( spy2a );
			sinon.assert.calledOnce( spy2b );
			sinon.assert.calledOnce( spy2c );
			sinon.assert.calledTwice( spyFire2a );
			sinon.assert.calledOnce( spyFire2b );
		} );

		// #187
		it( 'should work for DOM Nodes belonging to another window', done => {
			const spy = testUtils.sinon.spy();
			const iframe = document.createElement( 'iframe' );

			iframe.addEventListener( 'load', () => {
				const iframeNode = iframe.contentWindow.document.createElement( 'div' );

				domEmitter.listenTo( iframeNode, 'test', spy );

				iframeNode.dispatchEvent( new Event( 'test' ) );
				domEmitter.stopListening( iframeNode );
				iframeNode.dispatchEvent( new Event( 'test' ) );

				sinon.assert.calledOnce( spy );

				iframe.remove();
				done();
			} );

			document.body.appendChild( iframe );
		} );

		describe( 'event capturing', () => {
			beforeEach( () => {
				document.body.appendChild( node );
			} );

			afterEach( () => {
				document.body.removeChild( node );
			} );

			it( 'should remove listeners when re–listen', () => {
				const spy = testUtils.sinon.spy();

				domEmitter.listenTo( document, 'test', spy, { useCapture: true } );

				node.dispatchEvent( new Event( 'test' ) );
				sinon.assert.calledOnce( spy );

				domEmitter.stopListening( document, 'test' );

				node.dispatchEvent( new Event( 'test' ) );
				sinon.assert.calledOnce( spy );

				// Listen again.
				domEmitter.listenTo( document, 'test', spy, { useCapture: true } );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );
				sinon.assert.calledTwice( spy );

				domEmitter.stopListening( document, 'test' );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );
				sinon.assert.calledTwice( spy );
			} );
		} );
	} );
} );
