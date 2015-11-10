/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/element',
	'document/character',
	'document/attribute',
	'document/nodelist',
	'ckeditorerror'
);

describe( 'Node', function() {
	let Element, Character, Attribute, NodeList, CKEditorError;

	let root;
	let one, two, three;
	let charB, charA, charR, img;

	before( function() {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Attribute = modules[ 'document/attribute' ];
		NodeList = modules[ 'document/nodelist' ];
		CKEditorError = modules.ckeditorerror;

		charB = new Character( 'b' );
		charA = new Character( 'a' );
		img = new Element( 'img' );
		charR = new Character( 'r' );

		one = new Element( 'one' );
		two = new Element( 'two', null, [ charB, charA, img, charR ] );
		three = new Element( 'three' );

		root = new Element( null, null, [ one, two, three ] );
	} );

	describe( 'should have a correct property', function() {
		it( 'depth', function() {
			expect( root ).to.have.property( 'depth' ).that.equals( 0 );

			expect( one ).to.have.property( 'depth' ).that.equals( 1 );
			expect( two ).to.have.property( 'depth' ).that.equals( 1 );
			expect( three ).to.have.property( 'depth' ).that.equals( 1 );

			expect( charB ).to.have.property( 'depth' ).that.equals( 2 );
			expect( charA ).to.have.property( 'depth' ).that.equals( 2 );
			expect( img ).to.have.property( 'depth' ).that.equals( 2 );
			expect( charR ).to.have.property( 'depth' ).that.equals( 2 );
		} );

		it( 'root', function() {
			expect( root ).to.have.property( 'root' ).that.equals( root );

			expect( one ).to.have.property( 'root' ).that.equals( root );
			expect( two ).to.have.property( 'root' ).that.equals( root );
			expect( three ).to.have.property( 'root' ).that.equals( root );

			expect( charB ).to.have.property( 'root' ).that.equals( root );
			expect( charA ).to.have.property( 'root' ).that.equals( root );
			expect( img ).to.have.property( 'root' ).that.equals( root );
			expect( charR ).to.have.property( 'root' ).that.equals( root );
		} );

		it( 'nextSibling', function() {
			expect( root ).to.have.property( 'nextSibling' ).that.is.null;

			expect( one ).to.have.property( 'nextSibling' ).that.equals( two );
			expect( two ).to.have.property( 'nextSibling' ).that.equals( three );
			expect( three ).to.have.property( 'nextSibling' ).that.is.null;

			expect( charB ).to.have.property( 'nextSibling' ).that.equals( charA );
			expect( charA ).to.have.property( 'nextSibling' ).that.equals( img );
			expect( img ).to.have.property( 'nextSibling' ).that.equals( charR );
			expect( charR ).to.have.property( 'nextSibling' ).that.is.null;
		} );

		it( 'previousSibling', function() {
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

	describe( 'constructor', function() {
		it( 'should copy attributes, not pass by reference', function() {
			let attrs = [ new Attribute( 'attr', true ) ];
			let foo = new Element( 'foo', attrs );
			let bar = new Element( 'bar', attrs );

			foo.removeAttr( 'attr' );

			expect( foo._getAttrCount() ).to.equal( 0 );
			expect( bar._getAttrCount() ).to.equal( 1 );
		} );
	} );

	describe( 'getAttr', function() {
		let fooAttr, element;

		beforeEach( function() {
			fooAttr = new Attribute( 'foo', true );
			element = new Element( 'foo', [ fooAttr ] );
		} );

		it( 'should be possible to get attribute by key', function() {
			expect( element.getAttr( 'foo' ) ).to.equal( fooAttr.value );
		} );

		it( 'should return null if attribute was not found by key', function() {
			expect( element.getAttr( 'bar' ) ).to.be.null;
		} );
	} );

	describe( 'setAttr', function() {
		it( 'should insert an attribute', function() {
			let element = new Element( 'elem' );
			let attr = new Attribute( 'foo', 'bar' );

			element.setAttr( attr );

			expect( element._getAttrCount() ).to.equal( 1 );
			expect( element.getAttr( attr.key ) ).to.equal( attr.value );
		} );

		it( 'should overwrite attribute with the same key', function() {
			let oldAttr = new Attribute( 'foo', 'bar' );
			let newAttr = new Attribute( 'foo', 'bar' );
			let element = new Element( 'elem', [ oldAttr ] );

			element.setAttr( newAttr );

			expect( element._getAttrCount() ).to.equal( 1 );
			expect( element.getAttr( newAttr.key ) ).to.equal( newAttr.value );
		} );
	} );

	describe( 'removeAttr', function() {
		it( 'should remove an attribute', function() {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'b' );
			let attrC = new Attribute( 'c', 'C' );
			let element = new Element( 'elem', [ attrA, attrB, attrC ] );

			element.removeAttr( attrB.key );

			expect( element._getAttrCount() ).to.equal( 2 );
			expect( element.getAttr( attrA.key ) ).to.equal( attrA.value );
			expect( element.getAttr( attrC.key ) ).to.equal( attrC.value );
			expect( element.getAttr( attrB.key ) ).to.be.null;
		} );
	} );

	describe( 'hasAttr', function() {
		it( 'should check attribute by key', function() {
			let fooAttr = new Attribute( 'foo', true );
			let element = new Element( 'foo', [ fooAttr ] );

			expect( element.hasAttr( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by key', function() {
			let fooAttr = new Attribute( 'foo', true );
			let element = new Element( 'foo', [ fooAttr ] );

			expect( element.hasAttr( 'bar' ) ).to.be.false;
		} );

		it( 'should check attribute by object', function() {
			let fooAttr = new Attribute( 'foo', true );
			let foo2Attr = new Attribute( 'foo', true );
			let element = new Element( 'foo', [ fooAttr ] );

			expect( element.hasAttr( foo2Attr ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by object', function() {
			let fooAttr = new Attribute( 'foo', true );
			let element = new Element( 'foo' );

			expect( element.hasAttr( fooAttr ) ).to.be.false;
		} );

		it( 'should create proper JSON string using toJSON method', function() {
			let b = new Character( 'b' );
			let foo = new Element( 'foo', [], [ b ] );

			let parsedFoo = JSON.parse( JSON.stringify( foo ) );
			let parsedBar = JSON.parse( JSON.stringify( b ) );

			expect( parsedFoo.parent ).to.equal( null );
			expect( parsedBar.parent ).to.equal( 'foo' );
		} );
	} );

	describe( 'getIndex', function() {
		it( 'should return null if the parent is null', function() {
			expect( root.getIndex() ).to.be.null;
		} );

		it( 'should return index in the parent', function() {
			expect( one.getIndex() ).to.equal( 0 );
			expect( two.getIndex() ).to.equal( 1 );
			expect( three.getIndex() ).to.equal( 2 );

			expect( charB.getIndex() ).to.equal( 0 );
			expect( charA.getIndex() ).to.equal( 1 );
			expect( img.getIndex() ).to.equal( 2 );
			expect( charR.getIndex() ).to.equal( 3 );
		} );

		it( 'should throw an error if parent does not contains element', function() {
			let f = new Character( 'f' );
			let bar = new Element( 'bar', [], [] );

			f.parent = bar;

			expect(
				function() {
					f.getIndex();
				}
			).to.throw( CKEditorError, /node-not-found-in-parent/ );
		} );
	} );

	describe( 'getPath', function() {
		it( 'should return proper path', function() {
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
