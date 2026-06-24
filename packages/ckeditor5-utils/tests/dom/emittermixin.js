/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DomEmitterMixin } from '../../src/dom/emittermixin.js';
import { EmitterMixin } from '../../src/emittermixin.js';

describe( 'DomEmitterMixin', () => {
	const Emitter = EmitterMixin();
	const DomEmitter = DomEmitterMixin();

	let emitter, domEmitter, node;

	beforeEach( () => {
		emitter = new Emitter();
		domEmitter = new DomEmitter();
		node = document.createElement( 'div' );
	} );

	afterEach( () => {
		domEmitter.stopListening();
		vi.restoreAllMocks();
	} );

	it( 'mixes in EmitterMixin', () => {
		expect( new DomEmitter() ).toHaveProperty( 'on', Emitter.prototype.on );
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

		expect( observable ).toBeInstanceOf( TestClass );
		expect( observable.value ).toBe( 5 );
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

		expect( observable ).toBeInstanceOf( TestClass );
		expect( observable.value ).toBe( 5 );
	} );

	describe( 'listenTo', () => {
		it( 'should listen to EmitterMixin events', () => {
			const spy = vi.fn();

			domEmitter.listenTo( emitter, 'test', spy );
			emitter.fire( 'test' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should listen to native DOM events', () => {
			const spy = vi.fn();

			domEmitter.listenTo( node, 'test', spy );

			node.dispatchEvent( new Event( 'test' ) );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should listen to native DOM events - window as source', () => {
			const spy = vi.fn();

			domEmitter.listenTo( window, 'test', spy );

			window.dispatchEvent( new Event( 'test' ) );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should listen to native DOM events - document as source', () => {
			const spy = vi.fn();

			domEmitter.listenTo( document, 'test', spy );

			document.dispatchEvent( new Event( 'test' ) );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should listen to native DOM events - VisualViewport (EventTarget) as source', () => {
			const spy = vi.fn();

			domEmitter.listenTo( window.visualViewport, 'test', spy );

			window.visualViewport.dispatchEvent( new Event( 'test' ) );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		// #187
		it( 'should work for DOM Nodes belonging to another window', async () => {
			const spy = vi.fn();
			const iframe = document.createElement( 'iframe' );

			await new Promise( resolve => {
				iframe.addEventListener( 'load', () => {
					const iframeNode = iframe.contentWindow.document.createElement( 'div' );

					domEmitter.listenTo( iframeNode, 'test', spy );
					iframeNode.dispatchEvent( new Event( 'test' ) );

					expect( spy ).toHaveBeenCalledTimes( 1 );

					iframe.remove();
					resolve();
				} );

				document.body.appendChild( iframe );
			} );
		} );

		describe( 'event capturing', () => {
			beforeEach( () => {
				document.body.appendChild( node );
			} );

			afterEach( () => {
				document.body.removeChild( node );
			} );

			it( 'should not use capturing at default', () => {
				const spy = vi.fn();

				domEmitter.listenTo( document, 'test', spy );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should optionally use capturing', () => {
				const spy = vi.fn();

				domEmitter.listenTo( document, 'test', spy, { useCapture: true } );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should optionally use capturing if already listening', () => {
				const spy1 = vi.fn();
				const spy2 = vi.fn();

				domEmitter.listenTo( document, 'test', spy1 );
				domEmitter.listenTo( document, 'test', spy2, { useCapture: true } );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );

				expect( spy1 ).not.toHaveBeenCalled();
				expect( spy2 ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'event passive handling', () => {
			it( 'should not use passive mode by default', () => {
				const spy = vi.spyOn( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {} );

				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: false, passive: false } )
				);
			} );

			it( 'should optionally use passive mode', () => {
				const spy = vi.spyOn( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {}, { usePassive: true } );

				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: false, passive: true } )
				);
			} );

			it( 'should not get activated for event capturing (if not desired)', () => {
				const spy = vi.spyOn( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {}, { useCapture: true } );

				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: true, passive: false } )
				);
			} );

			it( 'should optionally use passive mode if already listening', () => {
				const spy = vi.spyOn( node, 'addEventListener' );

				domEmitter.listenTo( node, 'test', () => {} );
				domEmitter.listenTo( node, 'test', () => {}, { usePassive: true } );
				domEmitter.listenTo( node, 'test', () => {}, { useCapture: true } );
				domEmitter.listenTo( node, 'test', () => {}, { useCapture: true, usePassive: true } );

				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: false, passive: false } )
				);
				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: false, passive: true } )
				);
				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: true, passive: false } )
				);
				expect( spy ).toHaveBeenCalledWith(
					'test', expect.any( Function ), expect.objectContaining( { capture: true, passive: true } )
				);
			} );
		} );
	} );

	describe( 'stopListening', () => {
		it( 'should stop listening to EmitterMixin events, specific event', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			domEmitter.listenTo( emitter, 'foo', spy1 );
			domEmitter.listenTo( emitter, 'foo:bar', spy2 );

			emitter.fire( 'foo:bar' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( emitter, 'foo' );

			emitter.fire( 'foo:bar' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to EmitterMixin events, specific emitter', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			domEmitter.listenTo( emitter, 'foo', spy1 );
			domEmitter.listenTo( emitter, 'foo:bar', spy2 );

			emitter.fire( 'foo:bar' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( emitter );

			emitter.fire( 'foo:bar' );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should stop listening to a specific event callback', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			domEmitter.listenTo( node, 'event1', spy1 );
			domEmitter.listenTo( node, 'event2', spy2 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			domEmitter.stopListening( node, 'event1', spy1 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to a specific event callback (only from the given node)', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'event1', spy1 );
			domEmitter.listenTo( node1, 'event2', spy2 );
			domEmitter.listenTo( node2, 'event1', spy1 );

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );

			expect( spy1 ).toHaveBeenCalledTimes( 2 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( node1, 'event1', spy1 );

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );

			expect( spy1 ).toHaveBeenCalledTimes( 3 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to a specific event callback (re–listen)', () => {
			const spy = vi.fn();

			domEmitter.listenTo( node, 'event', spy );
			node.dispatchEvent( new Event( 'event' ) );
			domEmitter.stopListening( node, 'event', spy );

			domEmitter.listenTo( node, 'event', spy );
			node.dispatchEvent( new Event( 'event' ) );
			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to an specific event', () => {
			const spy1a = vi.fn();
			const spy1b = vi.fn();
			const spy2 = vi.fn();

			domEmitter.listenTo( node, 'event1', spy1a );
			domEmitter.listenTo( node, 'event1', spy1b );
			domEmitter.listenTo( node, 'event2', spy2 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( node, 'event1' );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to all events from a specific node', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			domEmitter.listenTo( node, 'event1', spy1 );
			domEmitter.listenTo( node, 'event2', spy2 );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			domEmitter.stopListening( node );

			node.dispatchEvent( new Event( 'event1' ) );
			node.dispatchEvent( new Event( 'event2' ) );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should stop listening to all events from a specific node (only that node)', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'event', spy1 );
			domEmitter.listenTo( node2, 'event', spy2 );

			node1.dispatchEvent( new Event( 'event' ) );
			node2.dispatchEvent( new Event( 'event' ) );

			domEmitter.stopListening( node1 );

			node1.dispatchEvent( new Event( 'event' ) );
			node2.dispatchEvent( new Event( 'event' ) );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should stop listening to all events from a VisualViewport (EventTarget)', () => {
			const spy = vi.fn();

			domEmitter.listenTo( window.visualViewport, 'event', spy );

			window.visualViewport.dispatchEvent( new Event( 'event' ) );

			domEmitter.stopListening( window.visualViewport );

			window.visualViewport.dispatchEvent( new Event( 'event' ) );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should stop listening to everything', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();

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

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should stop listening to everything what left', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();
			const spy4 = vi.fn();

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

			expect( spy1 ).not.toHaveBeenCalled();
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).not.toHaveBeenCalled();
			expect( spy4 ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening();

			node1.dispatchEvent( new Event( 'event1' ) );
			node1.dispatchEvent( new Event( 'event2' ) );
			node2.dispatchEvent( new Event( 'event1' ) );
			node2.dispatchEvent( new Event( 'event2' ) );

			expect( spy1 ).not.toHaveBeenCalled();
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spy3 ).not.toHaveBeenCalled();
			expect( spy4 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not stop other nodes when a non-listened node is provided', () => {
			const spy = vi.fn();

			const node1 = document.createElement( 'div' );
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node1, 'test', spy );

			domEmitter.stopListening( node2 );

			node1.dispatchEvent( new Event( 'test' ) );

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should pass DOM Event data to the listener', () => {
			const spy = vi.fn();

			domEmitter.listenTo( node, 'click', spy );

			const mouseEvent = new MouseEvent( 'click', {
				screenX: 10,
				screenY: 20
			} );

			node.dispatchEvent( mouseEvent );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( mouseEvent );
		} );

		it( 'should detach native DOM event listener proxy, specific event', () => {
			const spy1a = vi.fn();
			const spy1b = vi.fn();
			const spy1c = vi.fn();
			const spy2a = vi.fn();
			const spy2b = vi.fn();
			const spy2c = vi.fn();

			domEmitter.listenTo( node, 'test', spy1a );
			domEmitter.listenTo( node, 'test', spy1b, { useCapture: true } );
			domEmitter.listenTo( node, 'test', spy1c, { usePassive: true } );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { capture: false, passive: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { capture: true, passive: false } );
			const proxyEmitterC = domEmitter._getProxyEmitter( node, { capture: false, passive: true } );
			const spyFireA = vi.spyOn( proxyEmitterA, 'fire' );
			const spyFireB = vi.spyOn( proxyEmitterB, 'fire' );
			const spyFireC = vi.spyOn( proxyEmitterC, 'fire' );

			node.dispatchEvent( new Event( 'test' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 1 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );
			expect( spyFireC ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( node, 'test' );
			node.dispatchEvent( new Event( 'test' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 1 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test', spy2a );
			domEmitter.listenTo( node, 'test', spy2b, { useCapture: true } );
			domEmitter.listenTo( node, 'test', spy2c, { usePassive: true } );

			node.dispatchEvent( new Event( 'test' ) );

			expect( proxyEmitterA ).toBe( domEmitter._getProxyEmitter( node, { capture: false, passive: false } ) );
			expect( proxyEmitterB ).toBe( domEmitter._getProxyEmitter( node, { capture: true, passive: false } ) );
			expect( proxyEmitterC ).toBe( domEmitter._getProxyEmitter( node, { capture: false, passive: true } ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spy2a ).toHaveBeenCalledTimes( 1 );
			expect( spy2b ).toHaveBeenCalledTimes( 1 );
			expect( spy2c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 2 );
			expect( spyFireC ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should detach native DOM event listener proxy, specific callback', () => {
			const spy1a = vi.fn();
			const spy1b = vi.fn();
			const spy1c = vi.fn();
			const spy2 = vi.fn();

			domEmitter.listenTo( node, 'test', spy1a );
			domEmitter.listenTo( node, 'test', spy1b );
			domEmitter.listenTo( node, 'test', spy1c, { useCapture: true } );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { capture: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { capture: true } );
			const spyFireA = vi.spyOn( proxyEmitterA, 'fire' );
			const spyFireB = vi.spyOn( proxyEmitterB, 'fire' );

			node.dispatchEvent( new Event( 'test' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 1 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( node, 'test', spy1a );
			node.dispatchEvent( new Event( 'test' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 2 );
			expect( spy1c ).toHaveBeenCalledTimes( 2 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 2 );

			domEmitter.stopListening( node, 'test', spy1b );
			node.dispatchEvent( new Event( 'test' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 2 );
			expect( spy1c ).toHaveBeenCalledTimes( 3 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 3 );

			domEmitter.stopListening( node, 'test', spy1c );
			node.dispatchEvent( new Event( 'test' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 2 );
			expect( spy1c ).toHaveBeenCalledTimes( 3 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 3 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test', spy2 );
			node.dispatchEvent( new Event( 'test' ) );

			expect( proxyEmitterA ).toBe( domEmitter._getProxyEmitter( node, { capture: false } ) );
			expect( proxyEmitterB ).toBe( domEmitter._getProxyEmitter( node, { capture: true } ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 2 );
			expect( spy1c ).toHaveBeenCalledTimes( 3 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 3 );
			expect( spyFireB ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should detach native DOM event listener proxy, specific emitter', () => {
			const spy1a = vi.fn();
			const spy1b = vi.fn();
			const spy1c = vi.fn();
			const spy2a = vi.fn();
			const spy2b = vi.fn();
			const spy2c = vi.fn();

			domEmitter.listenTo( node, 'test1', spy1a );
			domEmitter.listenTo( node, 'test2', spy1b );
			domEmitter.listenTo( node, 'test2', spy1c, { usePassive: true } );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { passive: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { passive: true } );
			const spyFireA = vi.spyOn( proxyEmitterA, 'fire' );
			const spyFireB = vi.spyOn( proxyEmitterB, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening( node );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test1', spy2a );
			domEmitter.listenTo( node, 'test2', spy2b );
			domEmitter.listenTo( node, 'test2', spy2c, { usePassive: true } );

			// Old proxy emitter died when stopped listening to the node.
			const proxyEmitter2a = domEmitter._getProxyEmitter( node, { passive: false } );
			const proxyEmitter2b = domEmitter._getProxyEmitter( node, { passive: true } );
			const spyFire2a = vi.spyOn( proxyEmitter2a, 'fire' );
			const spyFire2b = vi.spyOn( proxyEmitter2b, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			expect( proxyEmitterA ).not.toBe( proxyEmitter2a );
			expect( proxyEmitterB ).not.toBe( proxyEmitter2b );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );
			expect( spy2a ).toHaveBeenCalledTimes( 1 );
			expect( spy2b ).toHaveBeenCalledTimes( 1 );
			expect( spy2c ).toHaveBeenCalledTimes( 1 );
			expect( spyFire2a ).toHaveBeenCalledTimes( 2 );
			expect( spyFire2b ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should detach native DOM event listener proxy, everything', () => {
			const spy1a = vi.fn();
			const spy1b = vi.fn();
			const spy1c = vi.fn();
			const spy2a = vi.fn();
			const spy2b = vi.fn();
			const spy2c = vi.fn();
			const spyEl2 = vi.fn();
			const node2 = document.createElement( 'div' );

			domEmitter.listenTo( node, 'test1', spy1a );
			domEmitter.listenTo( node, 'test2', spy1b );
			domEmitter.listenTo( node, 'test1', spy1c, { useCapture: true } );
			domEmitter.listenTo( node2, 'test1', spyEl2 );

			const proxyEmitterA = domEmitter._getProxyEmitter( node, { capture: false } );
			const proxyEmitterB = domEmitter._getProxyEmitter( node, { capture: true } );
			const spyFireA = vi.spyOn( proxyEmitterA, 'fire' );
			const spyFireB = vi.spyOn( proxyEmitterB, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );
			node2.dispatchEvent( new Event( 'test1' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );
			expect( spyEl2 ).toHaveBeenCalledTimes( 1 );

			domEmitter.stopListening();

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );
			node2.dispatchEvent( new Event( 'test1' ) );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );
			expect( spyEl2 ).toHaveBeenCalledTimes( 1 );

			// Attach same event again.
			domEmitter.listenTo( node, 'test1', spy2a );
			domEmitter.listenTo( node, 'test2', spy2b );
			domEmitter.listenTo( node, 'test2', spy2c, { useCapture: true } );

			// Old proxy emitter died when stopped listening to the node.
			const proxyEmitter2a = domEmitter._getProxyEmitter( node, { capture: false } );
			const proxyEmitter2b = domEmitter._getProxyEmitter( node, { capture: true } );
			const spyFire2a = vi.spyOn( proxyEmitter2a, 'fire' );
			const spyFire2b = vi.spyOn( proxyEmitter2b, 'fire' );

			node.dispatchEvent( new Event( 'test1' ) );
			node.dispatchEvent( new Event( 'test2' ) );

			expect( proxyEmitterA ).not.toBe( proxyEmitter2a );
			expect( proxyEmitterB ).not.toBe( proxyEmitter2b );

			expect( spy1a ).toHaveBeenCalledTimes( 1 );
			expect( spy1b ).toHaveBeenCalledTimes( 1 );
			expect( spy1c ).toHaveBeenCalledTimes( 1 );
			expect( spyFireA ).toHaveBeenCalledTimes( 2 );
			expect( spyFireB ).toHaveBeenCalledTimes( 1 );
			expect( spyEl2 ).toHaveBeenCalledTimes( 1 );
			expect( spy2a ).toHaveBeenCalledTimes( 1 );
			expect( spy2b ).toHaveBeenCalledTimes( 1 );
			expect( spy2c ).toHaveBeenCalledTimes( 1 );
			expect( spyFire2a ).toHaveBeenCalledTimes( 2 );
			expect( spyFire2b ).toHaveBeenCalledTimes( 1 );
		} );

		// #187
		it( 'should work for DOM Nodes belonging to another window', async () => {
			const spy = vi.fn();
			const iframe = document.createElement( 'iframe' );

			await new Promise( resolve => {
				iframe.addEventListener( 'load', () => {
					const iframeNode = iframe.contentWindow.document.createElement( 'div' );

					domEmitter.listenTo( iframeNode, 'test', spy );

					iframeNode.dispatchEvent( new Event( 'test' ) );
					domEmitter.stopListening( iframeNode );
					iframeNode.dispatchEvent( new Event( 'test' ) );

					expect( spy ).toHaveBeenCalledTimes( 1 );

					iframe.remove();
					resolve();
				} );

				document.body.appendChild( iframe );
			} );
		} );

		describe( 'event capturing', () => {
			beforeEach( () => {
				document.body.appendChild( node );
			} );

			afterEach( () => {
				document.body.removeChild( node );
			} );

			it( 'should remove listeners when re–listen', () => {
				const spy = vi.fn();

				domEmitter.listenTo( document, 'test', spy, { useCapture: true } );

				node.dispatchEvent( new Event( 'test' ) );
				expect( spy ).toHaveBeenCalledTimes( 1 );

				domEmitter.stopListening( document, 'test' );

				node.dispatchEvent( new Event( 'test' ) );
				expect( spy ).toHaveBeenCalledTimes( 1 );

				// Listen again.
				domEmitter.listenTo( document, 'test', spy, { useCapture: true } );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );
				expect( spy ).toHaveBeenCalledTimes( 2 );

				domEmitter.stopListening( document, 'test' );

				node.dispatchEvent( new Event( 'test', { bubbles: false } ) );
				expect( spy ).toHaveBeenCalledTimes( 2 );
			} );
		} );
	} );
} );
