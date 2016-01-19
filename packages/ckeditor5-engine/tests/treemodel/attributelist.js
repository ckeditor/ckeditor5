/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import AttributeList from '/ckeditor5/core/treemodel/attributelist.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';

describe( 'AttributeList', () => {
	let list, attrFooBar;

	beforeEach( () => {
		list = new AttributeList();
		attrFooBar = new Attribute( 'foo', 'bar' );
	} );

	it( 'should extend Map', () => {
		expect( list ).to.be.instanceof( Map );
	} );

	describe( 'constructor', () => {
		it( 'should initialize list with passed attributes', () => {
			list = new AttributeList( [ attrFooBar ] );
			expect( list.size ).to.equal( 1 );
			expect( list.has( 'foo' ) ).to.be.true;
			expect( list.get( 'foo' ).value ).to.equal( 'bar' );
		} );

		it( 'should copy passed AttributeList', () => {
			list = new AttributeList( [ attrFooBar ] );
			let copy = new AttributeList( list );

			expect( copy.size ).to.equal( 1 );
			expect( copy.has( 'foo' ) ).to.be.true;
			expect( copy.get( 'foo' ).value ).to.equal( 'bar' );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all added attributes', () => {
			let attrAbcXyz = new Attribute( 'abc', 'xyz' );
			let attrTestTrue = new Attribute( 'test', true );

			list = new AttributeList( [ attrFooBar, attrAbcXyz, attrTestTrue ] );
			list.delete( 'test' );

			let it = list[ Symbol.iterator ]();

			let step = it.next();

			expect( step.done ).to.be.false;
			expect( step.value ).to.equal( attrFooBar );

			step = it.next();

			expect( step.done ).to.be.false;
			expect( step.value ).to.equal( attrAbcXyz );

			step = it.next();

			expect( step.done ).to.be.true;
		} );
	} );

	describe( 'getValue', () => {
		it( 'should return value of set attribute for given key', () => {
			list.set( attrFooBar );
			expect( list.getValue( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should return null if attribute with given key is not set', () => {
			expect( list.getValue( 'foo' ) ).to.be.null;
		} );
	} );

	describe( 'set', () => {
		it( 'should insert given attribute', () => {
			list.set( attrFooBar );

			expect( list.size ).to.equal( 1 );
			expect( list.getValue( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should overwrite attribute with the same key', () => {
			list.set( attrFooBar );

			expect( list.size ).to.equal( 1 );
			expect( list.getValue( 'foo' ) ).to.equal( 'bar' );

			let attrFooXyz = new Attribute( 'foo', 'xyz' );

			list.set( attrFooXyz );

			expect( list.size ).to.equal( 1 );
			expect( list.getValue( 'foo' ) ).to.equal( 'xyz' );
		} );
	} );

	describe( 'setTo', () => {
		it( 'should remove all attributes from the list and set given ones', () => {
			list.set( attrFooBar );
			list.setTo( [ new Attribute( 'abc', true ), new Attribute( 'bar', false ) ] );

			expect( list.has( 'foo' ) ).to.be.false;
			expect( list.getValue( 'abc' ) ).to.be.true;
			expect( list.getValue( 'bar' ) ).to.be.false;
		} );
	} );

	describe( 'has', () => {
		it( 'should return true if list contains given attribute (same key and value)', () => {
			list.set( attrFooBar );

			expect( list.has( attrFooBar ) ).to.be.true;
		} );

		it( 'should return true if list contains an attribute with given key', () => {
			list.set( attrFooBar );

			expect( list.has( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if list does not contain given attribute', () => {
			list.set( attrFooBar );

			expect( list.has( new Attribute( 'abc', true ) ) ).to.be.false;
		} );

		it( 'should return false if list contains given attribute but value differs', () => {
			list.set( attrFooBar );

			expect( list.has( new Attribute( 'foo', 'foo' ) ) ).to.be.false;
		} );

		it( 'should return false if list does not contain an attribute with given key', () => {
			list.set( attrFooBar );

			expect( list.has( 'abc' ) ).to.be.false;
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return false if lists have different size', () => {
			let attrAbcXyz = new Attribute( 'abc', 'xyz' );
			list.setTo( [ attrFooBar, attrAbcXyz ] );

			let other = new AttributeList( [ attrFooBar ] );

			expect( list.isEqual( other ) ).to.be.false;
			expect( other.isEqual( list ) ).to.be.false;
		} );

		it( 'should return false if lists have different attributes', () => {
			let attrAbcXyz = new Attribute( 'abc', 'xyz' );
			list.setTo( [ attrFooBar ] );

			let other = new AttributeList( [ attrAbcXyz ] );

			expect( list.isEqual( other ) ).to.be.false;
			expect( other.isEqual( list ) ).to.be.false;
		} );

		it( 'should return false if lists have same attributes but different values for them', () => {
			let attrAbcXyz = new Attribute( 'abc', 'xyz' );
			let attrFooTrue = new Attribute( 'foo', true );

			list.setTo( [ attrFooBar, attrAbcXyz ] );

			let other = new AttributeList( [ attrFooTrue, attrAbcXyz ] );

			expect( list.isEqual( other ) ).to.be.false;
			expect( other.isEqual( list ) ).to.be.false;
		} );

		it( 'should return true if lists have same attributes and same values for them', () => {
			let attrAbcXyz = new Attribute( 'abc', 'xyz' );
			list.setTo( [ attrFooBar, attrAbcXyz ] );

			// Note different order of attributes.
			let other = new AttributeList( [ attrAbcXyz, attrFooBar ] );

			expect( list.isEqual( other ) ).to.be.true;
			expect( other.isEqual( list ) ).to.be.true;
		} );
	} );
} );
