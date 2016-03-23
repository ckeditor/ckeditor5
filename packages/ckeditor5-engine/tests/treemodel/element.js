/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Node from '/ckeditor5/engine/treemodel/node.js';
import NodeList from '/ckeditor5/engine/treemodel/nodelist.js';
import Element from '/ckeditor5/engine/treemodel/element.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			let element = new Element( 'elem' );
			let parent = new Element( 'parent', [], [ element ] );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element ).to.have.property( 'parent' ).that.equals( parent );
			expect( element._attrs.size ).to.equal( 0 );
		} );

		it( 'should create element with attributes', () => {
			let attr = { foo: 'bar' };

			let element = new Element( 'elem', [ attr ] );
			let parent = new Element( 'parent', [], [ element ] );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element ).to.have.property( 'parent' ).that.equals( parent );
			expect( element._attrs.size ).to.equal( 1 );
			expect( element.getAttribute( attr.key ) ).to.equal( attr.value );
		} );

		it( 'should create element with children', () => {
			let element = new Element( 'elem', [], 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should add children to the element', () => {
			let element = new Element( 'elem', [], [ 'xy' ] );
			element.insertChildren( 1, 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 5 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 4 ) ).to.have.property( 'character' ).that.equals( 'y' );
		} );
	} );

	describe( 'appendChildren', () => {
		it( 'should add children to the end of the element', () => {
			let element = new Element( 'elem', [], [ 'xy' ] );
			element.appendChildren( 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 5 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'y' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 4 ) ).to.have.property( 'character' ).that.equals( 'o' );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should remove children from the element and return them as a NodeList', () => {
			let element = new Element( 'elem', [], [ 'foobar' ] );
			let removed = element.removeChildren( 2, 3 );

			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'r' );

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 3 );

			expect( removed.get( 0 ).character ).to.equal( 'o' );
			expect( removed.get( 1 ).character ).to.equal( 'b' );
			expect( removed.get( 2 ).character ).to.equal( 'a' );
		} );

		it( 'should remove one child when second parameter is not specified', () => {
			let element = new Element( 'elem', [], [ 'foo' ] );
			let removed = element.removeChildren( 2 );

			expect( element.getChildCount() ).to.equal( 2 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 1 );

			expect( removed.get( 0 ).character ).to.equal( 'o' );
		} );
	} );

	describe( 'getChildIndex', () => {
		it( 'should return child index', () => {
			let element = new Element( 'elem', [], [ new Element( 'p' ), 'bar', new Element( 'h' ) ] );
			let p = element.getChild( 0 );
			let b = element.getChild( 1 );
			let a = element.getChild( 2 );
			let r = element.getChild( 3 );
			let h = element.getChild( 4 );

			expect( element.getChildIndex( p ) ).to.equal( 0 );
			expect( element.getChildIndex( b ) ).to.equal( 1 );
			expect( element.getChildIndex( a ) ).to.equal( 2 );
			expect( element.getChildIndex( r ) ).to.equal( 3 );
			expect( element.getChildIndex( h ) ).to.equal( 4 );
		} );
	} );

	describe( 'getChildCount', () => {
		it( 'should return number of children', () => {
			let element = new Element( 'elem', [], [ 'bar' ] );

			expect( element.getChildCount() ).to.equal( 3 );
		} );
	} );

	describe( 'attributes interface', () => {
		let node;

		beforeEach( () => {
			node = new Element();
		} );

		describe( 'setAttribute', () => {
			it( 'should set given attribute on the element', () => {
				node.setAttribute( 'foo', 'bar' );

				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );
		} );

		describe( 'setAttributesTo', () => {
			it( 'should remove all attributes set on element and set the given ones', () => {
				node.setAttribute( 'abc', 'xyz' );
				node.setAttributesTo( { foo: 'bar' } );

				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( node.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attribute set on the element and return true', () => {
				node.setAttribute( 'foo', 'bar' );
				let result = node.removeAttribute( 'foo' );

				expect( node.getAttribute( 'foo' ) ).to.be.undefined;
				expect( result ).to.be.true;
			} );

			it( 'should return false if element does not contain given attribute', () => {
				let result = node.removeAttribute( 'foo' );

				expect( result ).to.be.false;
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all attributes from the element', () => {
				node.setAttribute( 'foo', 'bar' );
				node.setAttribute( 'abc', 'xyz' );

				node.clearAttributes();

				expect( node.getAttribute( 'foo' ) ).to.be.undefined;
				expect( node.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );
	} );
} );
