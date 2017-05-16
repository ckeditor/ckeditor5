/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DocumentFragment from '../../src/view/documentfragment';
import Element from '../../src/view/element';
import Node from '../../src/view/node';

describe( 'DocumentFragment', () => {
	describe( 'constructor()', () => {
		it( 'should create DocumentFragment without children', () => {
			const fragment = new DocumentFragment();

			expect( fragment ).to.be.an.instanceof( DocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should create DocumentFragment with child node', () => {
			const child = new Element( 'p' );
			const fragment = new DocumentFragment( child );

			expect( fragment.childCount ).to.equal( 1 );
			expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );

		it( 'should create DocumentFragment with multiple nodes', () => {
			const children = [ new Element( 'p' ), new Element( 'div' ) ];
			const fragment = new DocumentFragment( children );

			expect( fragment.childCount ).to.equal( 2 );
			expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'div' );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes added to document fragment', () => {
			const children = [ new Element( 'p' ), new Element( 'div' ) ];
			const fragment = new DocumentFragment( children );

			const arr = Array.from( fragment );

			expect( arr.length ).to.equal( 2 );
			expect( arr[ 0 ] ).to.have.property( 'name' ).that.equals( 'p' );
			expect( arr[ 1 ] ).to.have.property( 'name' ).that.equals( 'div' );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return document fragment', () => {
			const fragment = new DocumentFragment();

			expect( fragment.root ).to.equal( fragment );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in document fragment', () => {
			const fragment = new DocumentFragment();

			expect( fragment.isEmpty ).to.be.true;
		} );

		it( 'should return false if there are children in document fragment', () => {
			const fragment = new DocumentFragment( [ new Element( 'p' ) ] );

			expect( fragment.isEmpty ).to.be.false;
		} );
	} );

	describe( 'is', () => {
		let frag;

		before( () => {
			frag = new DocumentFragment();
		} );

		it( 'should return true for documentFragment', () => {
			expect( frag.is( 'documentFragment' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( frag.is( 'text' ) ).to.be.false;
			expect( frag.is( 'textProxy' ) ).to.be.false;
			expect( frag.is( 'element' ) ).to.be.false;
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
			fragment = new DocumentFragment();
			el1 = new Element( 'el1' );
			el2 = new Element( 'el2' );
			el3 = new Element( 'el3' );
			el4 = new Element( 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				const count1 = fragment.insertChildren( 0, [ el1, el3 ] );
				const count2 = fragment.insertChildren( 1, el2 );

				expect( fragment.childCount ).to.equal( 3 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( fragment.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 2 );
				expect( count2 ).to.equal( 1 );
			} );

			it( 'should accept strings', () => {
				fragment.insertChildren( 0, 'abc' );

				expect( fragment.childCount ).to.equal( 1 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'abc' );

				fragment.removeChildren( 0, 1 );
				fragment.insertChildren( 0, [ new Element( 'p' ), 'abc' ] );

				expect( fragment.childCount ).to.equal( 2 );
				expect( fragment.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'abc' );
			} );

			it( 'should append children', () => {
				const count1 = fragment.insertChildren( 0, el1 );
				const count2 = fragment.appendChildren( el2 );
				const count3 = fragment.appendChildren( el3 );

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

				fragment.insertChildren( 0, el1 );
			} );

			it( 'should fire change event when appending', done => {
				fragment.once( 'change:children', ( event, node ) => {
					expect( node ).to.equal( fragment );
					done();
				} );

				fragment.appendChildren( el1 );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				fragment.appendChildren( el1 );
				fragment.appendChildren( el2 );
				fragment.appendChildren( el3 );

				expect( fragment.childCount ).to.equal( 3 );
				expect( fragment.getChildIndex( el1 ) ).to.equal( 0 );
				expect( fragment.getChildIndex( el2 ) ).to.equal( 1 );
				expect( fragment.getChildIndex( el3 ) ).to.equal( 2 );
			} );
		} );

		describe( 'getChildren', () => {
			it( 'should renturn children iterator', () => {
				fragment.appendChildren( el1 );
				fragment.appendChildren( el2 );
				fragment.appendChildren( el3 );

				const expected = [ el1, el2, el3 ];
				let i = 0;

				for ( const child of fragment.getChildren() ) {
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 3 );
			} );
		} );

		describe( 'removeChildren', () => {
			it( 'should remove children', () => {
				fragment.appendChildren( el1 );
				fragment.appendChildren( el2 );
				fragment.appendChildren( el3 );
				fragment.appendChildren( el4 );

				fragment.removeChildren( 1, 2 );

				expect( fragment.childCount ).to.equal( 2 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el4' );

				expect( el1.parent ).to.equal( fragment );
				expect( el2.parent ).to.be.null;
				expect( el3.parent ).to.be.null;
				expect( el4.parent ).equal( fragment );
			} );

			it( 'should remove one child when second parameter is not specified', () => {
				fragment.appendChildren( el1 );
				fragment.appendChildren( el2 );
				fragment.appendChildren( el3 );

				const removed = fragment.removeChildren( 1 );

				expect( fragment.childCount ).to.equal( 2 );
				expect( fragment.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( fragment.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el3' );

				expect( removed.length ).to.equal( 1 );
				expect( removed[ 0 ] ).to.have.property( 'name' ).that.equals( 'el2' );
			} );

			it( 'should fire change event', done => {
				fragment.appendChildren( el1 );

				fragment.once( 'change:children', ( event, node ) => {
					expect( node ).to.equal( fragment );
					done();
				} );

				fragment.removeChildren( 0 );
			} );
		} );
	} );

	describe( 'node methods when inserted to fragment', () => {
		it( 'index should return proper value', () => {
			const node1 = new Node();
			const node2 = new Node();
			const node3 = new Node();
			const fragment = new DocumentFragment( [ node1, node2, node3 ] );

			expect( node1.index ).to.equal( 0 );
			expect( node2.index ).to.equal( 1 );
			expect( node3.index ).to.equal( 2 );
			expect( node1.parent ).to.equal( fragment );
			expect( node2.parent ).to.equal( fragment );
			expect( node3.parent ).to.equal( fragment );
		} );

		it( 'nextSibling should return proper node', () => {
			const node1 = new Node();
			const node2 = new Node();
			const node3 = new Node();
			new DocumentFragment( [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.nextSibling ).to.equal( node2 );
			expect( node2.nextSibling ).to.equal( node3 );
			expect( node3.nextSibling ).to.be.null;
		} );

		it( 'previousSibling should return proper node', () => {
			const node1 = new Node();
			const node2 = new Node();
			const node3 = new Node();
			new DocumentFragment( [ node1, node2, node3 ] ); // eslint-disable-line no-new

			expect( node1.previousSibling ).to.be.null;
			expect( node2.previousSibling ).to.equal( node1 );
			expect( node3.previousSibling ).to.equal( node2 );
		} );

		it( 'remove() should remove node from fragment', () => {
			const node1 = new Node();
			const node2 = new Node();
			const node3 = new Node();
			const fragment = new DocumentFragment( [ node1, node2, node3 ] );

			node1.remove();
			node3.remove();

			expect( fragment.childCount ).to.equal( 1 );
			expect( node1.parent ).to.be.null;
			expect( node3.parent ).to.be.null;
			expect( fragment.getChild( 0 ) ).to.equal( node2 );
		} );
	} );
} );
