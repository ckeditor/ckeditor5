/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentFragment from '../../src/view/documentfragment';
import Element from '../../src/view/element';
import Node from '../../src/view/node';
import Text from '../../src/view/text';
import TextProxy from '../../src/view/textproxy';
import Document from '../../src/view/document';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'DocumentFragment', () => {
	let document, stylesProcessor;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();
		document = new Document( stylesProcessor );
	} );

	describe( 'constructor()', () => {
		it( 'should create DocumentFragment without children', () => {
			const fragment = new DocumentFragment( document );

			expect( fragment ).to.be.an.instanceof( DocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should create DocumentFragment  document,with child node', () => {
			const child = new Element( document, 'p' );
			const fragment = new DocumentFragment( document, child );

			expect( fragment.childCount ).to.equal( 1 );
			expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );

		it( 'should create DocumentFragment  document,with multiple nodes', () => {
			const children = [ new Element( document, 'p' ), new Element( document, 'div' ) ];
			const fragment = new DocumentFragment( document, children );

			expect( fragment.childCount ).to.equal( 2 );
			expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'div' );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes added to document fragment', () => {
			const children = [ new Element( document, 'p' ), new Element( document, 'div' ) ];
			const fragment = new DocumentFragment( document, children );

			const arr = Array.from( fragment );

			expect( arr.length ).to.equal( 2 );
			expect( arr[ 0 ] ).to.have.property( 'name' ).that.equals( 'p' );
			expect( arr[ 1 ] ).to.have.property( 'name' ).that.equals( 'div' );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return document fragment', () => {
			const fragment = new DocumentFragment( document );

			expect( fragment.root ).to.equal( fragment );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in document fragment', () => {
			const fragment = new DocumentFragment( document );

			expect( fragment.isEmpty ).to.be.true;
		} );

		it( 'should return false if there are children in document fragment', () => {
			const fragment = new DocumentFragment( document, [ new Element( document, 'p' ) ] );

			expect( fragment.isEmpty ).to.be.false;
		} );
	} );

	describe( 'is()', () => {
		let frag;

		before( () => {
			frag = new DocumentFragment( document );
		} );

		it( 'should return true for documentFragment', () => {
			expect( frag.is( 'documentFragment' ) ).to.be.true;
			expect( frag.is( 'view:documentFragment' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( frag.is( 'node' ) ).to.be.false;
			expect( frag.is( 'view:node' ) ).to.be.false;
			expect( frag.is( 'text' ) ).to.be.false;
			expect( frag.is( 'textProxy' ) ).to.be.false;
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
			fragment = new DocumentFragment( document );
			el1 = new Element( document, 'el1' );
			el2 = new Element( document, 'el2' );
			el3 = new Element( document, 'el3' );
			el4 = new Element( document, 'el4' );
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
				fragment._insertChild( 0, [ new Element( document, 'p' ), 'abc' ] );

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
				const frag = new DocumentFragment( document );
				const text = new Text( document, 'abcxyz' );
				const textProxy = new TextProxy( text, 2, 3 );

				frag._insertChild( 0, textProxy );

				expect( frag.childCount ).to.equal( 1 );
				expect( frag.getChild( 0 ) ).to.be.instanceof( Text );
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
			const node1 = new Node( document );
			const node2 = new Node( document );
			const node3 = new Node( document );
			const fragment = new DocumentFragment( document, [ node1, node2, node3 ] );

			expect( node1.index ).to.equal( 0 );
			expect( node2.index ).to.equal( 1 );
			expect( node3.index ).to.equal( 2 );
			expect( node1.parent ).to.equal( fragment );
			expect( node2.parent ).to.equal( fragment );
			expect( node3.parent ).to.equal( fragment );
		} );

		it( 'nextSibling should return proper node', () => {
			const node1 = new Node( document );
			const node2 = new Node( document );
			const node3 = new Node( document );
			new DocumentFragment( document, [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.nextSibling ).to.equal( node2 );
			expect( node2.nextSibling ).to.equal( node3 );
			expect( node3.nextSibling ).to.be.null;
		} );

		it( 'previousSibling should return proper node', () => {
			const node1 = new Node( document );
			const node2 = new Node( document );
			const node3 = new Node( document );
			new DocumentFragment( document, [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.previousSibling ).to.be.null;
			expect( node2.previousSibling ).to.equal( node1 );
			expect( node3.previousSibling ).to.equal( node2 );
		} );

		it( '_remove() should remove node from fragment', () => {
			const node1 = new Node( document );
			const node2 = new Node( document );
			const node3 = new Node( document );
			const fragment = new DocumentFragment( document, [ node1, node2, node3 ] );

			node1._remove();
			node3._remove();

			expect( fragment.childCount ).to.equal( 1 );
			expect( node1.parent ).to.be.null;
			expect( node3.parent ).to.be.null;
			expect( fragment.getChild( 0 ) ).to.equal( node2 );
		} );
	} );
} );
