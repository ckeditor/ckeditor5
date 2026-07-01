/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewNode } from '../../src/view/node.js';
import { ViewText } from '../../src/view/text.js';
import { ViewTextProxy } from '../../src/view/textproxy.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewContainerElement } from '../../src/index.js';

describe( 'DocumentFragment', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create DocumentFragment without children', () => {
			const fragment = new ViewDocumentFragment( document );

			expect( fragment ).toBeInstanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).toBe( 0 );
		} );

		it( 'should create DocumentFragment  document,with child node', () => {
			const child = new ViewElement( document, 'p' );
			const fragment = new ViewDocumentFragment( document, child );

			expect( fragment.childCount ).toBe( 1 );
			expect( fragment.getChild( 0 ) ).toHaveProperty( 'name', 'p' );
		} );

		it( 'should create DocumentFragment  document,with multiple nodes', () => {
			const children = [ new ViewElement( document, 'p' ), new ViewElement( document, 'div' ) ];
			const fragment = new ViewDocumentFragment( document, children );

			expect( fragment.childCount ).toBe( 2 );
			expect( fragment.getChild( 0 ) ).toHaveProperty( 'name', 'p' );
			expect( fragment.getChild( 1 ) ).toHaveProperty( 'name', 'div' );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes added to document fragment', () => {
			const children = [ new ViewElement( document, 'p' ), new ViewElement( document, 'div' ) ];
			const fragment = new ViewDocumentFragment( document, children );

			const arr = Array.from( fragment );

			expect( arr.length ).toBe( 2 );
			expect( arr[ 0 ] ).toHaveProperty( 'name', 'p' );
			expect( arr[ 1 ] ).toHaveProperty( 'name', 'div' );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return document fragment', () => {
			const fragment = new ViewDocumentFragment( document );

			expect( fragment.root ).toBe( fragment );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in document fragment', () => {
			const fragment = new ViewDocumentFragment( document );

			expect( fragment.isEmpty ).toBe( true );
		} );

		it( 'should return false if there are children in document fragment', () => {
			const fragment = new ViewDocumentFragment( document, [ new ViewElement( document, 'p' ) ] );

			expect( fragment.isEmpty ).toBe( false );
		} );
	} );

	describe( 'is()', () => {
		let frag;

		beforeEach( () => {
			frag = new ViewDocumentFragment( document );
		} );

		it( 'should return true for documentFragment', () => {
			expect( frag.is( 'documentFragment' ) ).toBe( true );
			expect( frag.is( 'view:documentFragment' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( frag.is( 'node' ) ).toBe( false );
			expect( frag.is( 'view:node' ) ).toBe( false );
			expect( frag.is( '$text' ) ).toBe( false );
			expect( frag.is( '$textProxy' ) ).toBe( false );
			expect( frag.is( 'element' ) ).toBe( false );
			expect( frag.is( 'view:element' ) ).toBe( false );
			expect( frag.is( 'containerElement' ) ).toBe( false );
			expect( frag.is( 'attributeElement' ) ).toBe( false );
			expect( frag.is( 'uiElement' ) ).toBe( false );
			expect( frag.is( 'emptyElement' ) ).toBe( false );
			expect( frag.is( 'rootElement' ) ).toBe( false );
		} );
	} );

	describe( 'children manipulation methods', () => {
		let fragment, el1, el2, el3, el4;

		beforeEach( () => {
			fragment = new ViewDocumentFragment( document );
			el1 = new ViewElement( document, 'el1' );
			el2 = new ViewElement( document, 'el2' );
			el3 = new ViewElement( document, 'el3' );
			el4 = new ViewElement( document, 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				const count1 = fragment._insertChild( 0, [ el1, el3 ] );
				const count2 = fragment._insertChild( 1, el2 );

				expect( fragment.childCount ).toBe( 3 );
				expect( fragment.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( fragment.getChild( 1 ) ).toHaveProperty( 'name', 'el2' );
				expect( fragment.getChild( 2 ) ).toHaveProperty( 'name', 'el3' );
				expect( count1 ).toBe( 2 );
				expect( count2 ).toBe( 1 );
			} );

			it( 'should accept strings', () => {
				fragment._insertChild( 0, 'abc' );

				expect( fragment.childCount ).toBe( 1 );
				expect( fragment.getChild( 0 ) ).toHaveProperty( 'data', 'abc' );

				fragment._removeChildren( 0, 1 );
				fragment._insertChild( 0, [ new ViewElement( document, 'p' ), 'abc' ] );

				expect( fragment.childCount ).toBe( 2 );
				expect( fragment.getChild( 1 ) ).toHaveProperty( 'data', 'abc' );
			} );

			it( 'should append children', () => {
				const count1 = fragment._insertChild( 0, el1 );
				const count2 = fragment._appendChild( el2 );
				const count3 = fragment._appendChild( el3 );

				expect( fragment.childCount ).toBe( 3 );
				expect( fragment.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( fragment.getChild( 1 ) ).toHaveProperty( 'name', 'el2' );
				expect( fragment.getChild( 2 ) ).toHaveProperty( 'name', 'el3' );
				expect( count1 ).toBe( 1 );
				expect( count2 ).toBe( 1 );
				expect( count3 ).toBe( 1 );
			} );

			it( 'should fire change event when inserting', () => {
				return new Promise( resolve => {
					fragment.once( 'change:children', ( event, node ) => {
						expect( node ).toBe( fragment );
						resolve();
					} );

					fragment._insertChild( 0, el1 );
				} );
			} );

			it( 'should fire change event when appending', () => {
				return new Promise( resolve => {
					fragment.once( 'change:children', ( event, node ) => {
						expect( node ).toBe( fragment );
						resolve();
					} );

					fragment._appendChild( el1 );
				} );
			} );

			it( 'should accept and correctly handle text proxies', () => {
				const frag = new ViewDocumentFragment( document );
				const text = new ViewText( document, 'abcxyz' );
				const textProxy = new ViewTextProxy( text, 2, 3 );

				frag._insertChild( 0, textProxy );

				expect( frag.childCount ).toBe( 1 );
				expect( frag.getChild( 0 ) ).toBeInstanceOf( ViewText );
				expect( frag.getChild( 0 ).data ).toBe( 'cxy' );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );

				expect( fragment.childCount ).toBe( 3 );
				expect( fragment.getChildIndex( el1 ) ).toBe( 0 );
				expect( fragment.getChildIndex( el2 ) ).toBe( 1 );
				expect( fragment.getChildIndex( el3 ) ).toBe( 2 );
			} );
		} );

		describe( 'getChildren', () => {
			it( 'should renturn children iterator', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );

				const expected = [ el1, el2, el3 ];
				let i = 0;

				for ( const child of fragment.getChildren() ) {
					expect( child ).toBe( expected[ i ] );
					i++;
				}

				expect( i ).toBe( 3 );
			} );
		} );

		describe( '_removeChildren', () => {
			it( 'should remove children', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );
				fragment._appendChild( el4 );

				fragment._removeChildren( 1, 2 );

				expect( fragment.childCount ).toBe( 2 );
				expect( fragment.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( fragment.getChild( 1 ) ).toHaveProperty( 'name', 'el4' );

				expect( el1.parent ).toBe( fragment );
				expect( el2.parent ).toBeNull();
				expect( el3.parent ).toBeNull();
				expect( el4.parent ).toBe( fragment );
			} );

			it( 'should remove one child when second parameter is not specified', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );

				const removed = fragment._removeChildren( 1 );

				expect( fragment.childCount ).toBe( 2 );
				expect( fragment.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( fragment.getChild( 1 ) ).toHaveProperty( 'name', 'el3' );

				expect( removed.length ).toBe( 1 );
				expect( removed[ 0 ] ).toHaveProperty( 'name', 'el2' );
			} );

			it( 'should fire change event', () => {
				fragment._appendChild( el1 );

				return new Promise( resolve => {
					fragment.once( 'change:children', ( event, node ) => {
						expect( node ).toBe( fragment );
						resolve();
					} );

					fragment._removeChildren( 0 );
				} );
			} );
		} );
	} );

	describe( 'node methods when inserted to fragment', () => {
		it( 'index should return proper value', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			const fragment = new ViewDocumentFragment( document, [ node1, node2, node3 ] );

			expect( node1.index ).toBe( 0 );
			expect( node2.index ).toBe( 1 );
			expect( node3.index ).toBe( 2 );
			expect( node1.parent ).toBe( fragment );
			expect( node2.parent ).toBe( fragment );
			expect( node3.parent ).toBe( fragment );
		} );

		it( 'nextSibling should return proper node', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			new ViewDocumentFragment( document, [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.nextSibling ).toBe( node2 );
			expect( node2.nextSibling ).toBe( node3 );
			expect( node3.nextSibling ).toBeNull();
		} );

		it( 'previousSibling should return proper node', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			new ViewDocumentFragment( document, [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.previousSibling ).toBeNull();
			expect( node2.previousSibling ).toBe( node1 );
			expect( node3.previousSibling ).toBe( node2 );
		} );

		it( '_remove() should remove node from fragment', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			const fragment = new ViewDocumentFragment( document, [ node1, node2, node3 ] );

			node1._remove();
			node3._remove();

			expect( fragment.childCount ).toBe( 1 );
			expect( node1.parent ).toBeNull();
			expect( node3.parent ).toBeNull();
			expect( fragment.getChild( 0 ) ).toBe( node2 );
		} );
	} );

	describe( 'custom properties', () => {
		it( 'should allow to set and get custom properties', () => {
			const fragment = new ViewDocumentFragment( document );

			fragment._setCustomProperty( 'foo', 'bar' );

			expect( fragment.getCustomProperty( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should allow to add symbol property', () => {
			const fragment = new ViewDocumentFragment( document );
			const symbol = Symbol( 'custom' );

			fragment._setCustomProperty( symbol, 'bar' );

			expect( fragment.getCustomProperty( symbol ) ).toBe( 'bar' );
		} );

		it( 'should allow to remove custom property', () => {
			const fragment = new ViewDocumentFragment( document );
			const symbol = Symbol( 'quix' );

			fragment._setCustomProperty( 'bar', 'baz' );
			fragment._setCustomProperty( symbol, 'test' );

			expect( fragment.getCustomProperty( 'bar' ) ).toBe( 'baz' );
			expect( fragment.getCustomProperty( symbol ) ).toBe( 'test' );

			fragment._removeCustomProperty( 'bar' );
			fragment._removeCustomProperty( symbol );

			expect( fragment.getCustomProperty( 'bar' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( symbol ) ).toBeUndefined();
		} );

		it( 'should allow to iterate over custom properties', () => {
			const fragment = new ViewDocumentFragment( document );

			fragment._setCustomProperty( 'foo', 1 );
			fragment._setCustomProperty( 'bar', 2 );
			fragment._setCustomProperty( 'baz', 3 );

			const properties = Array.from( fragment.getCustomProperties() );

			expect( properties[ 0 ][ 0 ] ).toBe( 'foo' );
			expect( properties[ 0 ][ 1 ] ).toBe( 1 );
			expect( properties[ 1 ][ 0 ] ).toBe( 'bar' );
			expect( properties[ 1 ][ 1 ] ).toBe( 2 );
			expect( properties[ 2 ][ 0 ] ).toBe( 'baz' );
			expect( properties[ 2 ][ 1 ] ).toBe( 3 );
		} );
	} );

	it( 'name should return undefined', () => {
		const fragment = new ViewDocumentFragment( document );

		expect( fragment.name ).toBeUndefined();
	} );

	describe( 'toJSON()', () => {
		it( 'should provide array of child nodes', () => {
			const fragment = new ViewDocumentFragment( document, [
				new ViewContainerElement( document, 'p', null, new ViewText( document, 'foo' ) ),
				new ViewContainerElement( document, 'h2', null, new ViewText( document, 'bar' ) )
			] );

			const json = JSON.stringify( fragment );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( [
				{
					name: 'p',
					path: [ 0 ],
					type: 'ContainerElement',
					children: [
						{
							data: 'foo',
							path: [ 0, 0 ],
							type: 'Text'
						}
					]
				},
				{
					name: 'h2',
					path: [ 1 ],
					type: 'ContainerElement',
					children: [
						{
							data: 'bar',
							path: [ 1, 0 ],
							type: 'Text'
						}
					]
				}
			] );
		} );
	} );
} );
