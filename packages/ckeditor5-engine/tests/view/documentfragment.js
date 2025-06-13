/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewNode } from '../../src/view/node.js';
import { ViewText } from '../../src/view/text.js';
import { TextProxy } from '../../src/view/textproxy.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'DocumentFragment', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create DocumentFragment without children', () => {
			const fragment = new ViewDocumentFragment( document );

			expect( fragment ).to.be.an.instanceof( ViewDocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should create DocumentFragment  document,with child node', () => {
			const child = new ViewElement( document, 'p' );
			const fragment = new ViewDocumentFragment( document, child );

			expect( fragment.childCount ).to.equal( 1 );
			expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );

		it( 'should create DocumentFragment  document,with multiple nodes', () => {
			const children = [ new ViewElement( document, 'p' ), new ViewElement( document, 'div' ) ];
			const fragment = new ViewDocumentFragment( document, children );

			expect( fragment.childCount ).to.equal( 2 );
			expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'div' );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes added to document fragment', () => {
			const children = [ new ViewElement( document, 'p' ), new ViewElement( document, 'div' ) ];
			const fragment = new ViewDocumentFragment( document, children );

			const arr = Array.from( fragment );

			expect( arr.length ).to.equal( 2 );
			expect( arr[ 0 ] ).to.have.property( 'name' ).that.equals( 'p' );
			expect( arr[ 1 ] ).to.have.property( 'name' ).that.equals( 'div' );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return document fragment', () => {
			const fragment = new ViewDocumentFragment( document );

			expect( fragment.root ).to.equal( fragment );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in document fragment', () => {
			const fragment = new ViewDocumentFragment( document );

			expect( fragment.isEmpty ).to.be.true;
		} );

		it( 'should return false if there are children in document fragment', () => {
			const fragment = new ViewDocumentFragment( document, [ new ViewElement( document, 'p' ) ] );

			expect( fragment.isEmpty ).to.be.false;
		} );
	} );

	describe( 'is()', () => {
		let frag;

		before( () => {
			frag = new ViewDocumentFragment( document );
		} );

		it( 'should return true for documentFragment', () => {
			expect( frag.is( 'documentFragment' ) ).to.be.true;
			expect( frag.is( 'view:documentFragment' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( frag.is( 'node' ) ).to.be.false;
			expect( frag.is( 'view:node' ) ).to.be.false;
			expect( frag.is( '$text' ) ).to.be.false;
			expect( frag.is( '$textProxy' ) ).to.be.false;
			expect( frag.is( 'element' ) ).to.be.false;
			expect( frag.is( 'view:element' ) ).to.be.false;
			expect( frag.is( 'containerElement' ) ).to.be.false;
			expect( frag.is( 'attributeElement' ) ).to.be.false;
			expect( frag.is( 'uiElement' ) ).to.be.false;
			expect( frag.is( 'emptyElement' ) ).to.be.false;
			expect( frag.is( 'rootElement' ) ).to.be.false;
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

				expect( fragment.childCount ).to.equal( 3 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( fragment.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 2 );
				expect( count2 ).to.equal( 1 );
			} );

			it( 'should accept strings', () => {
				fragment._insertChild( 0, 'abc' );

				expect( fragment.childCount ).to.equal( 1 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'abc' );

				fragment._removeChildren( 0, 1 );
				fragment._insertChild( 0, [ new ViewElement( document, 'p' ), 'abc' ] );

				expect( fragment.childCount ).to.equal( 2 );
				expect( fragment.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'abc' );
			} );

			it( 'should append children', () => {
				const count1 = fragment._insertChild( 0, el1 );
				const count2 = fragment._appendChild( el2 );
				const count3 = fragment._appendChild( el3 );

				expect( fragment.childCount ).to.equal( 3 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( fragment.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 1 );
				expect( count2 ).to.equal( 1 );
				expect( count3 ).to.equal( 1 );
			} );

			it( 'should fire change event when inserting', done => {
				fragment.once( 'change:children', ( event, node ) => {
					expect( node ).to.equal( fragment );
					done();
				} );

				fragment._insertChild( 0, el1 );
			} );

			it( 'should fire change event when appending', done => {
				fragment.once( 'change:children', ( event, node ) => {
					expect( node ).to.equal( fragment );
					done();
				} );

				fragment._appendChild( el1 );
			} );

			it( 'should accept and correctly handle text proxies', () => {
				const frag = new ViewDocumentFragment( document );
				const text = new ViewText( document, 'abcxyz' );
				const textProxy = new TextProxy( text, 2, 3 );

				frag._insertChild( 0, textProxy );

				expect( frag.childCount ).to.equal( 1 );
				expect( frag.getChild( 0 ) ).to.be.instanceof( ViewText );
				expect( frag.getChild( 0 ).data ).to.equal( 'cxy' );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );

				expect( fragment.childCount ).to.equal( 3 );
				expect( fragment.getChildIndex( el1 ) ).to.equal( 0 );
				expect( fragment.getChildIndex( el2 ) ).to.equal( 1 );
				expect( fragment.getChildIndex( el3 ) ).to.equal( 2 );
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
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 3 );
			} );
		} );

		describe( '_removeChildren', () => {
			it( 'should remove children', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );
				fragment._appendChild( el4 );

				fragment._removeChildren( 1, 2 );

				expect( fragment.childCount ).to.equal( 2 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el4' );

				expect( el1.parent ).to.equal( fragment );
				expect( el2.parent ).to.be.null;
				expect( el3.parent ).to.be.null;
				expect( el4.parent ).equal( fragment );
			} );

			it( 'should remove one child when second parameter is not specified', () => {
				fragment._appendChild( el1 );
				fragment._appendChild( el2 );
				fragment._appendChild( el3 );

				const removed = fragment._removeChildren( 1 );

				expect( fragment.childCount ).to.equal( 2 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el3' );

				expect( removed.length ).to.equal( 1 );
				expect( removed[ 0 ] ).to.have.property( 'name' ).that.equals( 'el2' );
			} );

			it( 'should fire change event', done => {
				fragment._appendChild( el1 );

				fragment.once( 'change:children', ( event, node ) => {
					expect( node ).to.equal( fragment );
					done();
				} );

				fragment._removeChildren( 0 );
			} );
		} );
	} );

	describe( 'node methods when inserted to fragment', () => {
		it( 'index should return proper value', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			const fragment = new ViewDocumentFragment( document, [ node1, node2, node3 ] );

			expect( node1.index ).to.equal( 0 );
			expect( node2.index ).to.equal( 1 );
			expect( node3.index ).to.equal( 2 );
			expect( node1.parent ).to.equal( fragment );
			expect( node2.parent ).to.equal( fragment );
			expect( node3.parent ).to.equal( fragment );
		} );

		it( 'nextSibling should return proper node', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			new ViewDocumentFragment( document, [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.nextSibling ).to.equal( node2 );
			expect( node2.nextSibling ).to.equal( node3 );
			expect( node3.nextSibling ).to.be.null;
		} );

		it( 'previousSibling should return proper node', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			new ViewDocumentFragment( document, [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.previousSibling ).to.be.null;
			expect( node2.previousSibling ).to.equal( node1 );
			expect( node3.previousSibling ).to.equal( node2 );
		} );

		it( '_remove() should remove node from fragment', () => {
			const node1 = new ViewNode( document );
			const node2 = new ViewNode( document );
			const node3 = new ViewNode( document );
			const fragment = new ViewDocumentFragment( document, [ node1, node2, node3 ] );

			node1._remove();
			node3._remove();

			expect( fragment.childCount ).to.equal( 1 );
			expect( node1.parent ).to.be.null;
			expect( node3.parent ).to.be.null;
			expect( fragment.getChild( 0 ) ).to.equal( node2 );
		} );
	} );

	describe( 'custom properties', () => {
		it( 'should allow to set and get custom properties', () => {
			const fragment = new ViewDocumentFragment( document );

			fragment._setCustomProperty( 'foo', 'bar' );

			expect( fragment.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should allow to add symbol property', () => {
			const fragment = new ViewDocumentFragment( document );
			const symbol = Symbol( 'custom' );

			fragment._setCustomProperty( symbol, 'bar' );

			expect( fragment.getCustomProperty( symbol ) ).to.equal( 'bar' );
		} );

		it( 'should allow to remove custom property', () => {
			const fragment = new ViewDocumentFragment( document );
			const symbol = Symbol( 'quix' );

			fragment._setCustomProperty( 'bar', 'baz' );
			fragment._setCustomProperty( symbol, 'test' );

			expect( fragment.getCustomProperty( 'bar' ) ).to.equal( 'baz' );
			expect( fragment.getCustomProperty( symbol ) ).to.equal( 'test' );

			fragment._removeCustomProperty( 'bar' );
			fragment._removeCustomProperty( symbol );

			expect( fragment.getCustomProperty( 'bar' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( symbol ) ).to.be.undefined;
		} );

		it( 'should allow to iterate over custom properties', () => {
			const fragment = new ViewDocumentFragment( document );

			fragment._setCustomProperty( 'foo', 1 );
			fragment._setCustomProperty( 'bar', 2 );
			fragment._setCustomProperty( 'baz', 3 );

			const properties = Array.from( fragment.getCustomProperties() );

			expect( properties[ 0 ][ 0 ] ).to.equal( 'foo' );
			expect( properties[ 0 ][ 1 ] ).to.equal( 1 );
			expect( properties[ 1 ][ 0 ] ).to.equal( 'bar' );
			expect( properties[ 1 ][ 1 ] ).to.equal( 2 );
			expect( properties[ 2 ][ 0 ] ).to.equal( 'baz' );
			expect( properties[ 2 ][ 1 ] ).to.equal( 3 );
		} );
	} );

	it( 'name should return undefined', () => {
		const fragment = new ViewDocumentFragment( document );

		expect( fragment.name ).to.be.undefined;
	} );
} );
