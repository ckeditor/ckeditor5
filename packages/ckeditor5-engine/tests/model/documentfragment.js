/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import NodeList from '/ckeditor5/engine/model/nodelist.js';
import Element from '/ckeditor5/engine/model/element.js';
import DocumentFragment from '/ckeditor5/engine/model/documentfragment.js';

describe( 'DocumentFragment', () => {
	describe( 'constructor', () => {
		it( 'should create empty document fragment', () => {
			let frag = new DocumentFragment();

			expect( frag.getChildCount() ).to.equal( 0 );
		} );

		it( 'should create document fragment with children', () => {
			let frag = new DocumentFragment( [ 'x', new Element( 'p' ), 'y' ] );

			expect( frag.getChildCount() ).to.equal( 3 );
			expect( frag.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
			expect( frag.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( frag.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'y' );
		} );

		it( 'should have root property, equal to itself', () => {
			let frag = new DocumentFragment();

			expect( frag ).to.have.property( 'root' ).that.equals( frag );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes added to document fragment', () => {
			let frag = new DocumentFragment( [ 'x', new Element( 'p' ), 'y' ] );
			let arr = Array.from( frag );

			expect( arr.length ).to.equal( 3 );
			expect( arr[ 0 ] ).to.have.property( 'character' ).that.equals( 'x' );
			expect( arr[ 1 ] ).to.have.property( 'name' ).that.equals( 'p' );
			expect( arr[ 2 ] ).to.have.property( 'character' ).that.equals( 'y' );
		} );
	} );

	describe( 'getPath', () => {
		it( 'should return empty array', () => {
			let frag = new DocumentFragment( [ 'x', new Element( 'p' ), 'y' ] );

			expect( frag.getPath() ).to.deep.equal( [] );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should add children to the document fragment', () => {
			let frag = new DocumentFragment( 'xy' );
			frag.insertChildren( 1, 'foo' );

			expect( frag.getChildCount() ).to.equal( 5 );
			expect( frag.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
			expect( frag.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( frag.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( frag.getChild( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( frag.getChild( 4 ) ).to.have.property( 'character' ).that.equals( 'y' );
		} );

		it( 'should accept DocumentFragment as a parameter and clean it after it is added', () => {
			let p1 = new Element( 'p' );
			let p2 = new Element( 'p' );
			let otherFrag = new DocumentFragment( [ p1, p2 ] );

			let frag = new DocumentFragment();

			frag.insertChildren( 0, otherFrag );

			expect( frag.getChildCount() ).to.equal( 2 );
			expect( frag.getChild( 0 ) ).to.equal( p1 );
			expect( frag.getChild( 1 ) ).to.equal( p2 );
			expect( otherFrag.getChildCount() ).to.equal( 0 );
		} );
	} );

	describe( 'appendChildren', () => {
		it( 'should add children to the end of the element', () => {
			let frag = new DocumentFragment( 'xy' );
			frag.appendChildren( 'foo' );

			expect( frag.getChildCount() ).to.equal( 5 );
			expect( frag.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
			expect( frag.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'y' );
			expect( frag.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( frag.getChild( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( frag.getChild( 4 ) ).to.have.property( 'character' ).that.equals( 'o' );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should remove children from the element and return them as a NodeList', () => {
			let frag = new DocumentFragment( 'foobar' );
			let removed = frag.removeChildren( 2, 3 );

			expect( frag.getChildCount() ).to.equal( 3 );
			expect( frag.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( frag.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( frag.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'r' );

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 3 );

			expect( removed.get( 0 ).character ).to.equal( 'o' );
			expect( removed.get( 1 ).character ).to.equal( 'b' );
			expect( removed.get( 2 ).character ).to.equal( 'a' );
		} );

		it( 'should remove one child when second parameter is not specified', () => {
			let frag = new DocumentFragment( 'foo' );
			let removed = frag.removeChildren( 2 );

			expect( frag.getChildCount() ).to.equal( 2 );
			expect( frag.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( frag.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 1 );

			expect( removed.get( 0 ).character ).to.equal( 'o' );
		} );
	} );

	describe( 'getChildIndex', () => {
		it( 'should return child index', () => {
			let frag = new DocumentFragment( [ new Element( 'p' ), 'bar', new Element( 'h' ) ] );
			let p = frag.getChild( 0 );
			let b = frag.getChild( 1 );
			let a = frag.getChild( 2 );
			let r = frag.getChild( 3 );
			let h = frag.getChild( 4 );

			expect( frag.getChildIndex( p ) ).to.equal( 0 );
			expect( frag.getChildIndex( b ) ).to.equal( 1 );
			expect( frag.getChildIndex( a ) ).to.equal( 2 );
			expect( frag.getChildIndex( r ) ).to.equal( 3 );
			expect( frag.getChildIndex( h ) ).to.equal( 4 );
		} );
	} );

	describe( 'getChildCount', () => {
		it( 'should return number of children', () => {
			let frag = new DocumentFragment( 'bar' );

			expect( frag.getChildCount() ).to.equal( 3 );
		} );
	} );
} );
