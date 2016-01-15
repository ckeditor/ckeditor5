/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

/* bender-include: ../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'core/treeview/node',
	'core/treeview/element'
);

describe( 'Element', () => {
	let ViewElement, Node;

	before( () => {
		ViewElement = modules[ 'core/treeview/element' ];
		Node = modules[ 'core/treeview/node' ];
	} );

	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const elem = new ViewElement( 'p' );

			expect( elem ).to.be.an.instanceof( Node );
			expect( elem ).to.have.property( 'name' ).that.equals( 'p' );
			expect( elem ).to.have.property( 'parent' ).that.is.null;
			expect( getIteratorCount( elem.getAttrKeys() ) ).to.equal( 0 );
		} );

		it( 'should create element with attributes as plain object', () => {
			const elem = new ViewElement( 'p', { 'foo': 'bar' } );

			expect( elem ).to.have.property( 'name' ).that.equals( 'p' );
			expect( getIteratorCount( elem.getAttrKeys() ) ).to.equal( 1 );
			expect( elem.getAttr( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with attributes as map', () => {
			const attrs = new Map();
			attrs.set( 'foo', 'bar' );

			const elem = new ViewElement( 'p', attrs );

			expect( elem ).to.have.property( 'name' ).that.equals( 'p' );
			expect( getIteratorCount( elem.getAttrKeys() ) ).to.equal( 1 );
			expect( elem.getAttr( 'foo' ) ).to.equal( 'bar' );
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
		let parent, e1, e2, e3, e4;

		beforeEach( () => {
			parent = new ViewElement( 'p' );
			e1 = new ViewElement( 'e1' );
			e2 = new ViewElement( 'e2' );
			e3 = new ViewElement( 'e3' );
			e4 = new ViewElement( 'e4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				parent.insertChildren( 0, [ e1, e3 ] );
				parent.insertChildren( 1, e2 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'e1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'e2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'e3' );
			} );

			it( 'should append children', () => {
				parent.insertChildren( 0, e1 );
				parent.appendChildren( e2 );
				parent.appendChildren( e3 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'e1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'e2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'e3' );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				parent.appendChildren( e1 );
				parent.appendChildren( e2 );
				parent.appendChildren( e3 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChildIndex( e1 ) ).to.equal( 0 );
				expect( parent.getChildIndex( e2 ) ).to.equal( 1 );
				expect( parent.getChildIndex( e3 ) ).to.equal( 2 );
			} );
		} );

		describe( 'getChildren', () => {
			it( 'should renturn children iterator', () => {
				parent.appendChildren( e1 );
				parent.appendChildren( e2 );
				parent.appendChildren( e3 );

				const expected = [ e1, e2, e3 ];
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
				parent.appendChildren( e1 );
				parent.appendChildren( e2 );
				parent.appendChildren( e3 );
				parent.appendChildren( e4 );

				parent.removeChildren( 1, 2 );

				expect( parent.getChildCount() ).to.equal( 2 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'e1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'e4' );

				expect( e1.parent ).to.equal( parent );
				expect( e2.parent ).to.be.null;
				expect( e3.parent ).to.be.null;
				expect( e4.parent ).equal( parent );
			} );
		} );
	} );

	describe( 'attributes manipulation methods', () => {
		let elem;

		beforeEach( () => {
			elem = new ViewElement( 'p' );
		} );

		describe( 'getAttr', () => {
			it( 'should return attribute', () => {
				elem.setAttr( 'foo', 'bar' );

				expect( elem.getAttr( 'foo' ) ).to.equal( 'bar' );
				expect( elem.getAttr( 'bom' ) ).to.not.be.ok;
			} );
		} );

		describe( 'hasAttr', () => {
			it( 'should return true if element has attribute', () => {
				elem.setAttr( 'foo', 'bar' );

				expect( elem.hasAttr( 'foo' ) ).to.be.true;
				expect( elem.hasAttr( 'bom' ) ).to.be.false;
			} );
		} );

		describe( 'getAttrKeys', () => {
			it( 'should return keys', () => {
				elem.setAttr( 'foo', true );
				elem.setAttr( 'bar', true );

				const expected = [ 'foo', 'bar' ];
				let i = 0;

				for ( let child of elem.getAttrKeys() ) {
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 2 );
			} );
		} );

		describe( 'removeAttr', () => {
			it( 'should remove attributes', () => {
				elem.setAttr( 'foo', true );

				expect( elem.hasAttr( 'foo' ) ).to.be.true;

				elem.removeAttr( 'foo' );

				expect( elem.hasAttr( 'foo' ) ).to.be.false;

				expect( getIteratorCount( elem.getAttrKeys() ) ).to.equal( 0 );
			} );
		} );
	} );
} );
