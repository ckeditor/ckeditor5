/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import AttributeList from '/ckeditor5/core/treemodel/attributelist.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';

const getIteratorCount = coreTestUtils.getIteratorCount;

describe( 'AttributeList', () => {
	let list, attrFooBar;

	beforeEach( () => {
		list = new AttributeList();
		attrFooBar = new Attribute( 'foo', 'bar' );
	} );

	describe( 'setAttr', () => {
		it( 'should insert an attribute', () => {
			list.setAttr( attrFooBar );

			expect( getIteratorCount( list.getAttrs() ) ).to.equal( 1 );
			expect( list.getAttr( attrFooBar.key ) ).to.equal( attrFooBar.value );
		} );

		it( 'should overwrite attribute with the same key', () => {
			list.setAttr( attrFooBar );

			expect( getIteratorCount( list.getAttrs() ) ).to.equal( 1 );
			expect( list.getAttr( 'foo' ) ).to.equal( 'bar' );

			let attrFooXyz = new Attribute( 'foo', 'xyz' );

			list.setAttr( attrFooXyz );

			expect( getIteratorCount( list.getAttrs() ) ).to.equal( 1 );
			expect( list.getAttr( 'foo' ) ).to.equal( 'xyz' );
		} );
	} );

	describe( 'setAttrsTo', () => {
		it( 'should remove all attributes and set passed ones', () => {
			list.setAttr( attrFooBar );

			let attrs = [ new Attribute( 'abc', true ), new Attribute( 'xyz', false ) ];

			list.setAttrsTo( attrs );

			expect( getIteratorCount( list.getAttrs() ) ).to.equal( 2 );
			expect( list.getAttr( 'foo' ) ).to.be.null;
			expect( list.getAttr( 'abc' ) ).to.be.true;
			expect( list.getAttr( 'xyz' ) ).to.be.false;
		} );

		it( 'should copy attributes array, not pass by reference', () => {
			let attrs = [ new Attribute( 'attr', true ) ];

			list.setAttrsTo( attrs );

			attrs.pop();

			expect( getIteratorCount( list.getAttrs() ) ).to.equal( 1 );
		} );
	} );

	describe( 'getAttr', () => {
		beforeEach( () => {
			list.setAttr( attrFooBar );
		} );

		it( 'should return attribute value if key of previously set attribute has been passed', () => {
			expect( list.getAttr( 'foo' ) ).to.equal( attrFooBar.value );
		} );

		it( 'should return null if attribute with given key has not been found', () => {
			expect( list.getAttr( 'bar' ) ).to.be.null;
		} );
	} );

	describe( 'removeAttr', () => {
		it( 'should remove an attribute', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'B' );
			let attrC = new Attribute( 'c', 'C' );

			list.setAttr( attrA );
			list.setAttr( attrB );
			list.setAttr( attrC );

			list.removeAttr( attrB.key );

			expect( getIteratorCount( list.getAttrs() ) ).to.equal( 2 );
			expect( list.getAttr( attrA.key ) ).to.equal( attrA.value );
			expect( list.getAttr( attrC.key ) ).to.equal( attrC.value );
			expect( list.getAttr( attrB.key ) ).to.be.null;
		} );
	} );

	describe( 'hasAttr', () => {
		it( 'should check attribute by key', () => {
			list.setAttr( attrFooBar );
			expect( list.hasAttr( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by key', () => {
			expect( list.hasAttr( 'bar' ) ).to.be.false;
		} );

		it( 'should check attribute by object', () => {
			list.setAttr( attrFooBar );
			expect( list.hasAttr( attrFooBar ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by object', () => {
			expect( list.hasAttr( attrFooBar ) ).to.be.false;
		} );
	} );

	describe( 'getAttrs', () => {
		it( 'should return all set attributes', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'B' );
			let attrC = new Attribute( 'c', 'C' );

			list.setAttrsTo( [
				attrA,
				attrB,
				attrC
			] );

			list.removeAttr( attrB.key );

			let attrsIt = list.getAttrs();
			let attrs = [];

			for ( let attr of attrsIt ) {
				attrs.push( attr );
			}

			expect( [ attrA, attrC ] ).to.deep.equal( attrs );
		} );
	} );
} );
