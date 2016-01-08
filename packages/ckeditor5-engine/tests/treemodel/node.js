/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */
/* bender-include: ../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'core/treemodel/element',
	'core/treemodel/character',
	'core/treemodel/attribute',
	'core/treemodel/attributelist',
	'core/treemodel/nodelist',
	'core/ckeditorerror'
);

describe( 'Node', () => {
	let Element, Character, Attribute, AttributeList, NodeList, CKEditorError;

	let root;
	let one, two, three;
	let charB, charA, charR, img, attrEle;
	let attrFooBar;

	before( () => {
		Element = modules[ 'core/treemodel/element' ];
		Character = modules[ 'core/treemodel/character' ];
		Attribute = modules[ 'core/treemodel/attribute' ];
		AttributeList = modules[ 'core/treemodel/attributelist' ];
		NodeList = modules[ 'core/treemodel/nodelist' ];
		CKEditorError = modules[ 'core/ckeditorerror' ];

		charB = new Character( 'b' );
		charA = new Character( 'a' );
		img = new Element( 'img' );
		charR = new Character( 'r' );

		one = new Element( 'one' );
		two = new Element( 'two', null, [ charB, charA, img, charR ] );
		three = new Element( 'three' );

		root = new Element( null, null, [ one, two, three ] );

		attrFooBar = new Attribute( 'foo', 'bar' );
	} );

	beforeEach( () => {
		attrEle = new Element( 'element' );
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
		it( 'should copy attributes list, not pass by reference', () => {
			let attrs = [ new Attribute( 'attr', true ) ];
			let foo = new Element( 'foo', attrs );
			let bar = new Element( 'bar', attrs );

			foo.removeAttr( 'attr' );

			expect( getIteratorCount( foo.getAttrs() ) ).to.equal( 0 );
			expect( getIteratorCount( bar.getAttrs() ) ).to.equal( 1 );
		} );
	} );

	it( 'should create proper JSON string using toJSON method', () => {
		let b = new Character( 'b' );
		let foo = new Element( 'foo', [], [ b ] );

		let parsedFoo = JSON.parse( JSON.stringify( foo ) );
		let parsedBar = JSON.parse( JSON.stringify( b ) );

		expect( parsedFoo.parent ).to.equal( null );
		expect( parsedBar.parent ).to.equal( 'foo' );
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

	// Testing integration with attributes list.
	// Tests copied from AttributeList tests.
	// Some cases were omitted.

	describe( 'setAttr', () => {
		it( 'should insert an attribute', () => {
			attrEle.setAttr( attrFooBar );

			expect( getIteratorCount( attrEle.getAttrs() ) ).to.equal( 1 );
			expect( attrEle.getAttr( attrFooBar.key ) ).to.equal( attrFooBar.value );
		} );
	} );

	describe( 'setAttrsTo', () => {
		it( 'should remove all attributes and set passed ones', () => {
			attrEle.setAttr( attrFooBar );

			let attrs = [ new Attribute( 'abc', true ), new Attribute( 'xyz', false ) ];

			attrEle.setAttrsTo( attrs );

			expect( getIteratorCount( attrEle.getAttrs() ) ).to.equal( 2 );
			expect( attrEle.getAttr( 'foo' ) ).to.be.null;
			expect( attrEle.getAttr( 'abc' ) ).to.be.true;
			expect( attrEle.getAttr( 'xyz' ) ).to.be.false;
		} );
	} );

	describe( 'getAttr', () => {
		beforeEach( () => {
			attrEle = new Element( 'e', [ attrFooBar ] );
		} );

		it( 'should return attribute value if key of previously set attribute has been passed', () => {
			expect( attrEle.getAttr( 'foo' ) ).to.equal( attrFooBar.value );
		} );

		it( 'should return null if attribute with given key has not been found', () => {
			expect( attrEle.getAttr( 'bar' ) ).to.be.null;
		} );
	} );

	describe( 'removeAttr', () => {
		it( 'should remove an attribute', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'B' );
			let attrC = new Attribute( 'c', 'C' );

			attrEle.setAttr( attrA );
			attrEle.setAttr( attrB );
			attrEle.setAttr( attrC );

			attrEle.removeAttr( attrB.key );

			expect( getIteratorCount( attrEle.getAttrs() ) ).to.equal( 2 );
			expect( attrEle.getAttr( attrA.key ) ).to.equal( attrA.value );
			expect( attrEle.getAttr( attrC.key ) ).to.equal( attrC.value );
			expect( attrEle.getAttr( attrB.key ) ).to.be.null;
		} );
	} );

	describe( 'hasAttr', () => {
		it( 'should check attribute by key', () => {
			attrEle.setAttr( attrFooBar );
			expect( attrEle.hasAttr( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by key', () => {
			expect( attrEle.hasAttr( 'bar' ) ).to.be.false;
		} );

		it( 'should check attribute by object', () => {
			attrEle.setAttr( attrFooBar );
			expect( attrEle.hasAttr( attrFooBar ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by object', () => {
			expect( attrEle.hasAttr( attrFooBar ) ).to.be.false;
		} );
	} );

	describe( 'getAttrs', () => {
		it( 'should return all set attributes', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'B' );
			let attrC = new Attribute( 'c', 'C' );

			attrEle.setAttrsTo( [
				attrA,
				attrB,
				attrC
			] );

			attrEle.removeAttr( attrB.key );

			expect( [ attrA, attrC ] ).to.deep.equal( Array.from( attrEle.getAttrs() ) );
		} );
	} );
} );
