/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import Node from '/ckeditor5/core/treeview/node.js';
import ViewElement from '/ckeditor5/core/treeview/element.js';

const getIteratorCount = coreTestUtils.getIteratorCount;

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const el = new ViewElement( 'p' );

			expect( el ).to.be.an.instanceof( Node );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( el ).to.have.property( 'parent' ).that.is.null;
			expect( getIteratorCount( el.getAttrKeys() ) ).to.equal( 0 );
		} );

		it( 'should create element with attributes as plain object', () => {
			const el = new ViewElement( 'p', { 'foo': 'bar' } );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( getIteratorCount( el.getAttrKeys() ) ).to.equal( 1 );
			expect( el.getAttr( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with attributes as map', () => {
			const attrs = new Map();
			attrs.set( 'foo', 'bar' );

			const el = new ViewElement( 'p', attrs );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( getIteratorCount( el.getAttrKeys() ) ).to.equal( 1 );
			expect( el.getAttr( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with children', () => {
			const child = new ViewElement( 'p', { 'foo': 'bar' } );
			const parent = new ViewElement( 'div', [], [ child ] );

			expect( parent ).to.have.property( 'name' ).that.equals( 'div' );
			expect( parent.getChildCount() ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );
	} );

	describe( 'children manipulation methods', () => {
		let parent, el1, el2, el3, el4;

		beforeEach( () => {
			parent = new ViewElement( 'p' );
			el1 = new ViewElement( 'el1' );
			el2 = new ViewElement( 'el2' );
			el3 = new ViewElement( 'el3' );
			el4 = new ViewElement( 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				parent.insertChildren( 0, [ el1, el3 ] );
				parent.insertChildren( 1, el2 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
			} );

			it( 'should append children', () => {
				parent.insertChildren( 0, el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChildIndex( el1 ) ).to.equal( 0 );
				expect( parent.getChildIndex( el2 ) ).to.equal( 1 );
				expect( parent.getChildIndex( el3 ) ).to.equal( 2 );
			} );
		} );

		describe( 'getChildren', () => {
			it( 'should renturn children iterator', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );

				const expected = [ el1, el2, el3 ];
				let i = 0;

				for ( let child of parent.getChildren() ) {
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 3 );
			} );
		} );

		describe( 'removeChildren', () => {
			it( 'should remove children', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );
				parent.appendChildren( el4 );

				parent.removeChildren( 1, 2 );

				expect( parent.getChildCount() ).to.equal( 2 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el4' );

				expect( el1.parent ).to.equal( parent );
				expect( el2.parent ).to.be.null;
				expect( el3.parent ).to.be.null;
				expect( el4.parent ).equal( parent );
			} );
		} );
	} );

	describe( 'attributes manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( 'p' );
		} );

		describe( 'getAttr', () => {
			it( 'should return attribute', () => {
				el.setAttr( 'foo', 'bar' );

				expect( el.getAttr( 'foo' ) ).to.equal( 'bar' );
				expect( el.getAttr( 'bom' ) ).to.not.be.ok;
			} );
		} );

		describe( 'hasAttr', () => {
			it( 'should return true if element has attribute', () => {
				el.setAttr( 'foo', 'bar' );

				expect( el.hasAttr( 'foo' ) ).to.be.true;
				expect( el.hasAttr( 'bom' ) ).to.be.false;
			} );
		} );

		describe( 'getAttrKeys', () => {
			it( 'should return keys', () => {
				el.setAttr( 'foo', true );
				el.setAttr( 'bar', true );

				const expected = [ 'foo', 'bar' ];
				let i = 0;

				for ( let child of el.getAttrKeys() ) {
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 2 );
			} );
		} );

		describe( 'removeAttr', () => {
			it( 'should remove attributes', () => {
				el.setAttr( 'foo', true );

				expect( el.hasAttr( 'foo' ) ).to.be.true;

				el.removeAttr( 'foo' );

				expect( el.hasAttr( 'foo' ) ).to.be.false;

				expect( getIteratorCount( el.getAttrKeys() ) ).to.equal( 0 );
			} );
		} );
	} );
} );
