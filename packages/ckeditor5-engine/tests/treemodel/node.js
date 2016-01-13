/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Element from '/ckeditor5/core/treemodel/element.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import AttributeList from '/ckeditor5/core/treemodel/attributelist.js';
import NodeList from '/ckeditor5/core/treemodel/nodelist.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Node', () => {
	let root;
	let one, two, three;
	let charB, charA, charR, img;

	before( () => {
		charB = new Character( 'b' );
		charA = new Character( 'a' );
		img = new Element( 'img' );

		one = new Element( 'one' );
		two = new Element( 'two', null, [ 'b', 'a', img, 'r' ] );
		charB = two.getChild( 0 );
		charA = two.getChild( 1 );
		charR = two.getChild( 3 );
		three = new Element( 'three' );

		root = new Element( null, null, [ one, two, three ] );
	} );

	describe( 'should have a correct property', () => {
		it( 'depth', () => {
			expect( root ).to.have.property( 'depth' ).that.equals( 0 );

			expect( one ).to.have.property( 'depth' ).that.equals( 1 );
			expect( two ).to.have.property( 'depth' ).that.equals( 1 );
			expect( three ).to.have.property( 'depth' ).that.equals( 1 );

			expect( charB ).to.have.property( 'depth' ).that.equals( 2 );
			expect( charA ).to.have.property( 'depth' ).that.equals( 2 );
			expect( img ).to.have.property( 'depth' ).that.equals( 2 );
			expect( charR ).to.have.property( 'depth' ).that.equals( 2 );
		} );

		it( 'root', () => {
			expect( root ).to.have.property( 'root' ).that.equals( root );

			expect( one ).to.have.property( 'root' ).that.equals( root );
			expect( two ).to.have.property( 'root' ).that.equals( root );
			expect( three ).to.have.property( 'root' ).that.equals( root );

			expect( charB ).to.have.property( 'root' ).that.equals( root );
			expect( charA ).to.have.property( 'root' ).that.equals( root );
			expect( img ).to.have.property( 'root' ).that.equals( root );
			expect( charR ).to.have.property( 'root' ).that.equals( root );
		} );

		it( 'nextSibling', () => {
			expect( root ).to.have.property( 'nextSibling' ).that.is.null;

			expect( one ).to.have.property( 'nextSibling' ).that.equals( two );
			expect( two ).to.have.property( 'nextSibling' ).that.equals( three );
			expect( three ).to.have.property( 'nextSibling' ).that.is.null;

			expect( charB ).to.have.property( 'nextSibling' ).that.equals( charA );
			expect( charA ).to.have.property( 'nextSibling' ).that.equals( img );
			expect( img ).to.have.property( 'nextSibling' ).that.equals( charR );
			expect( charR ).to.have.property( 'nextSibling' ).that.is.null;
		} );

		it( 'previousSibling', () => {
			expect( root ).to.have.property( 'previousSibling' ).that.is.expect;

			expect( one ).to.have.property( 'previousSibling' ).that.is.null;
			expect( two ).to.have.property( 'previousSibling' ).that.equals( one );
			expect( three ).to.have.property( 'previousSibling' ).that.equals( two );

			expect( charB ).to.have.property( 'previousSibling' ).that.is.null;
			expect( charA ).to.have.property( 'previousSibling' ).that.equals( charB );
			expect( img ).to.have.property( 'previousSibling' ).that.equals( charA );
			expect( charR ).to.have.property( 'previousSibling' ).that.equals( img );
		} );
	} );

	describe( 'constructor', () => {
		it( 'should create empty attribute list if no parameters were passed', () => {
			let foo = new Element( 'foo' );

			expect( foo.attrs ).to.be.instanceof( AttributeList );
			expect( foo.attrs.size ).to.equal( 0 );
		} );

		it( 'should initialize attribute list with passed attributes', () => {
			let attrs = [
				new Attribute( 'foo', true ),
				new Attribute( 'bar', false )
			];
			let foo = new Element( 'foo', attrs );

			expect( foo.attrs.size ).to.equal( 2 );
			expect( foo.attrs.getValue( 'foo' ) ).to.equal( true );
			expect( foo.attrs.getValue( 'bar' ) ).to.equal( false );
		} );
	} );

	it( 'should create proper JSON string using toJSON method', () => {
		let foo = new Element( 'foo', [], [ 'b' ] );

		let parsedFoo = JSON.parse( JSON.stringify( foo ) );

		expect( parsedFoo.parent ).to.equal( null );
		expect( parsedFoo._children._nodes[ 0 ].parent ).to.equal( 'foo' );
	} );

	describe( 'getIndex', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.getIndex() ).to.be.null;
		} );

		it( 'should return index in the parent', () => {
			expect( one.getIndex() ).to.equal( 0 );
			expect( two.getIndex() ).to.equal( 1 );
			expect( three.getIndex() ).to.equal( 2 );

			expect( charB.getIndex() ).to.equal( 0 );
			expect( charA.getIndex() ).to.equal( 1 );
			expect( img.getIndex() ).to.equal( 2 );
			expect( charR.getIndex() ).to.equal( 3 );
		} );

		it( 'should throw an error if parent does not contains element', () => {
			let e = new Element( 'e' );
			let bar = new Element( 'bar', [], [] );

			e.parent = bar;

			expect(
				() => {
					e.getIndex();
				}
			).to.throw( CKEditorError, /node-not-found-in-parent/ );
		} );
	} );

	describe( 'getPath', () => {
		it( 'should return proper path', () => {
			expect( root.getPath() ).to.deep.equal( [] );

			expect( one.getPath() ).to.deep.equal( [ 0 ] );
			expect( two.getPath() ).to.deep.equal( [ 1 ] );
			expect( three.getPath() ).to.deep.equal( [ 2 ] );

			expect( charB.getPath() ).to.deep.equal( [ 1, 0 ] );
			expect( charA.getPath() ).to.deep.equal( [ 1, 1 ] );
			expect( img.getPath() ).to.deep.equal( [ 1, 2 ] );
			expect( charR.getPath() ).to.deep.equal( [ 1, 3 ] );
		} );
	} );
} );
