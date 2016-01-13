/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Node from '/ckeditor5/core/treemodel/node.js';
import NodeList from '/ckeditor5/core/treemodel/nodelist.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			let element = new Element( 'elem' );
			let parent = new Element( 'parent', [], [ element ] );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element ).to.have.property( 'parent' ).that.equals( parent );
			expect( element.attrs.size ).to.equal( 0 );
		} );

		it( 'should create element with attributes', () => {
			let attr = new Attribute( 'foo', 'bar' );

			let element = new Element( 'elem', [ attr ] );
			let parent = new Element( 'parent', [], [ element ] );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element ).to.have.property( 'parent' ).that.equals( parent );
			expect( element.attrs.size ).to.equal( 1 );
			expect( element.attrs.getValue( attr.key ) ).to.equal( attr.value );
		} );

		it( 'should create element with children', () => {
			let element = new Element( 'elem', [], 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getChild( 0 ) ).to.have.property( 'text' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'text' ).that.equals( 'o' );
			expect( element.getChild( 2 ) ).to.have.property( 'text' ).that.equals( 'o' );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should add children to the element', () => {
			let element = new Element( 'elem', [], [ 'xy' ] );
			element.insertChildren( 1, 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 5 );
			expect( element.getChild( 0 ) ).to.have.property( 'text' ).that.equals( 'x' );
			expect( element.getChild( 1 ) ).to.have.property( 'text' ).that.equals( 'f' );
			expect( element.getChild( 2 ) ).to.have.property( 'text' ).that.equals( 'o' );
			expect( element.getChild( 3 ) ).to.have.property( 'text' ).that.equals( 'o' );
			expect( element.getChild( 4 ) ).to.have.property( 'text' ).that.equals( 'y' );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should remove children from the element and return them as a NodeList', () => {
			let element = new Element( 'elem', [], [ 'foobar' ] );
			let removed = element.removeChildren( 2, 3 );

			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getChild( 0 ) ).to.have.property( 'text' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'text' ).that.equals( 'o' );
			expect( element.getChild( 2 ) ).to.have.property( 'text' ).that.equals( 'r' );

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 3 );

			expect( removed.get( 0 ).text ).to.equal( 'o' );
			expect( removed.get( 1 ).text ).to.equal( 'b' );
			expect( removed.get( 2 ).text ).to.equal( 'a' );
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
} );
