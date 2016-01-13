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

		describe( 'cloneDomAttrs', () => {
			it( 'should clone DOM attributes', () => {
				const domElement = document.createElement( 'p' );
				domElement.setAttribute( 'foo', '1' );
				domElement.setAttribute( 'bar', '2' );

				elem.cloneDomAttrs( domElement );

				expect( elem.getAttr( 'foo' ) ).to.equal( '1' );
				expect( elem.getAttr( 'bar' ) ).to.equal( '2' );
				expect( getIteratorCount( elem.getAttrKeys() ) ).to.equal( 2 );
			} );
		} );
	} );

	describe( 'DOM-View binding', () => {
		describe( 'getCorespondingView', () => {
			it( 'should return coresponding view element', () => {
				const domElement = document.createElement( 'p' );
				const viewElement = new ViewElement( 'p' );

				viewElement.bindDomElement( domElement );

				expect( ViewElement.getCorespondingView( domElement ) ).to.equal( viewElement );
			} );
		} );

		describe( 'getCorespondingDom', () => {
			it( 'should return coresponding DOM element', () => {
				const domElement = document.createElement( 'p' );
				const viewElement = new ViewElement( 'p' );

				viewElement.bindDomElement( domElement );

				expect( viewElement.getCorespondingDom() ).to.equal( domElement );
			} );
		} );

		describe( 'createFromDom', () => {
			it( 'should create tree of view elements from DOM elements', () => {
				const domImg = document.createElement( 'img' );
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.setAttribute( 'class', 'foo' );

				domP.appendChild( domImg );
				domP.appendChild( domText );

				const viewImg = new ViewElement( 'img' );

				viewImg.bindDomElement( domImg );

				const viewP = ViewElement.createFromDom( domP );

				expect( viewP ).to.be.an.instanceof( ViewElement );
				expect( viewP.name ).to.equal( 'p' );

				expect( viewP.getAttr( 'class' ) ).to.equal( 'foo' );
				expect( getIteratorCount( viewP.getAttrKeys() ) ).to.equal( 1 );

				expect( viewP.getChildCount() ).to.equal( 2 );
				expect( viewP.getChild( 0 ).name ).to.equal( 'img' );
				expect( viewP.getChild( 1 ).getText() ).to.equal( 'foo' );

				expect( viewP.getCorespondingDom() ).to.not.equal( domP );
				expect( viewP.getChild( 0 ).getCorespondingDom() ).to.equal( domImg );
			} );
		} );
	} );
} );
