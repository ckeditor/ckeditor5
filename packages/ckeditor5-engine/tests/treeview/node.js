/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

/* bender-include: ../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'core/treeview/element',
	'core/treeview/node',
	'core/treeview/text',
	'core/ckeditorerror'
);

describe( 'Node', () => {
	let Element, Text, Node, CKEditorError;

	let root;
	let one, two, three;
	let charB, charA, charR, img;

	before( () => {
		Element = modules[ 'core/treeview/element' ];
		Node = modules[ 'core/treeview/node' ];
		Text = modules[ 'core/treeview/text' ];
		CKEditorError = modules[ 'ckeditorerror ' ];

		charB = new Text( 'b' );
		charA = new Text( 'a' );
		img = new Element( 'img' );
		charR = new Text( 'r' );

		one = new Element( 'one' );
		two = new Element( 'two', null, [ charB, charA, img, charR ] );
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

		it( 'getNextSibling', () => {
			expect( root.getNextSibling() ).to.be.null;

			expect( one.getNextSibling() ).to.equal( two );
			expect( two.getNextSibling() ).to.equal( three );
			expect( three.getNextSibling() ).to.be.null;

			expect( charB.getNextSibling() ).to.equal( charA );
			expect( charA.getNextSibling() ).to.equal( img );
			expect( img.getNextSibling() ).to.equal( charR );
			expect( charR.getNextSibling() ).to.be.null;
		} );

		it( 'previousSibling', () => {
			expect( root.getPreviousSibling() ).to.be.null;

			expect( one.getPreviousSibling() ).to.be.null;
			expect( two.getPreviousSibling() ).to.equal( one );
			expect( three.getPreviousSibling() ).to.equal( two );

			expect( charB.getPreviousSibling() ).to.be.null;
			expect( charA.getPreviousSibling() ).to.equal( charB );
			expect( img.getPreviousSibling() ).to.equal( charA );
			expect( charR.getPreviousSibling() ).to.equal( img );
		} );
	} );

	describe( 'constructor', () => {
		it( 'should copy attributes, not pass by reference', () => {
			let attrs = [ new Attribute( 'attr', true ) ];
			let foo = new Element( 'foo', { 'class': 'bold' } );
			let bar = new Element( 'bar', { 'class': 'bold' } );

			foo.removeAttr( 'attr' );

			expect( getIteratorCount( foo.getAttrs() ) ).to.equal( 0 );
			expect( getIteratorCount( bar.getAttrs() ) ).to.equal( 1 );
		} );
	} );

	describe( 'getAttr', () => {
		let fooAttr, element;

		beforeEach( () => {
			fooAttr = new Attribute( 'foo', true );
			element = new Element( 'foo', [ fooAttr ] );
		} );

		it( 'should be possible to get attribute by key', () => {
			expect( element.getAttr( 'foo' ) ).to.equal( fooAttr.value );
		} );

		it( 'should return null if attribute was not found by key', () => {
			expect( element.getAttr( 'bar' ) ).to.be.null;
		} );
	} );

	describe( 'setAttr', () => {
		it( 'should insert an attribute', () => {
			let element = new Element( 'elem' );
			let attr = new Attribute( 'foo', 'bar' );

			element.setAttr( attr );

			expect( getIteratorCount( element.getAttrs() ) ).to.equal( 1 );
			expect( element.getAttr( attr.key ) ).to.equal( attr.value );
		} );

		it( 'should overwrite attribute with the same key', () => {
			let oldAttr = new Attribute( 'foo', 'bar' );
			let newAttr = new Attribute( 'foo', 'bar' );
			let element = new Element( 'elem', [ oldAttr ] );

			element.setAttr( newAttr );

			expect( getIteratorCount( element.getAttrs() ) ).to.equal( 1 );
			expect( element.getAttr( newAttr.key ) ).to.equal( newAttr.value );
		} );
	} );

	describe( 'removeAttr', () => {
		it( 'should remove an attribute', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'b' );
			let attrC = new Attribute( 'c', 'C' );
			let element = new Element( 'elem', [ attrA, attrB, attrC ] );

			element.removeAttr( attrB.key );

			expect( getIteratorCount( element.getAttrs() ) ).to.equal( 2 );
			expect( element.getAttr( attrA.key ) ).to.equal( attrA.value );
			expect( element.getAttr( attrC.key ) ).to.equal( attrC.value );
			expect( element.getAttr( attrB.key ) ).to.be.null;
		} );
	} );

	describe( 'hasAttr', () => {
		it( 'should check attribute by key', () => {
			let fooAttr = new Attribute( 'foo', true );
			let element = new Element( 'foo', [ fooAttr ] );

			expect( element.hasAttr( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by key', () => {
			let fooAttr = new Attribute( 'foo', true );
			let element = new Element( 'foo', [ fooAttr ] );

			expect( element.hasAttr( 'bar' ) ).to.be.false;
		} );

		it( 'should check attribute by object', () => {
			let fooAttr = new Attribute( 'foo', true );
			let foo2Attr = new Attribute( 'foo', true );
			let element = new Element( 'foo', [ fooAttr ] );

			expect( element.hasAttr( foo2Attr ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by object', () => {
			let fooAttr = new Attribute( 'foo', true );
			let element = new Element( 'foo' );

			expect( element.hasAttr( fooAttr ) ).to.be.false;
		} );

		it( 'should create proper JSON string using toJSON method', () => {
			let b = new Character( 'b' );
			let foo = new Element( 'foo', [], [ b ] );

			let parsedFoo = JSON.parse( JSON.stringify( foo ) );
			let parsedBar = JSON.parse( JSON.stringify( b ) );

			expect( parsedFoo.parent ).to.equal( null );
			expect( parsedBar.parent ).to.equal( 'foo' );
		} );
	} );

	describe( 'getAttrs', () => {
		it( 'should allows to get attribute count', () => {
			let element = new Element( 'foo', [
				new Attribute( 1, true ),
				new Attribute( 2, true ),
				new Attribute( 3, true )
			] );

			expect( getIteratorCount( element.getAttrs() ) ).to.equal( 3 );
		} );

		it( 'should allows to copy attributes', () => {
			let element = new Element( 'foo', [ new Attribute( 'x', true ) ] );
			let copy = new Element( 'bar', element.getAttrs() );

			expect( copy.getAttr( 'x' ) ).to.be.true;
		} );
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
			let f = new Character( 'f' );
			let bar = new Element( 'bar', [], [] );

			f.parent = bar;

			expect(
				() => {
					f.getIndex();
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
