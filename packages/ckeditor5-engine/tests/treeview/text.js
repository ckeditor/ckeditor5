/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

/* bender-include: ../_tools/tools.js */

'use strict';

const modules = bender.amd.require(
	'core/treeview/node',
	'core/treeview/element',
	'core/treeview/text'
);

describe( 'Element', () => {
	let ViewText, ViewElement, ViewNode;

	before( () => {
		ViewText = modules[ 'core/treeview/text' ];
		ViewElement = modules[ 'core/treeview/element' ];
		ViewNode = modules[ 'core/treeview/node' ];
	} );

	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const text = new ViewText( 'foo' );

			expect( text ).to.be.an.instanceof( ViewNode );
			expect( text.getText() ).to.equal( 'foo' );
			expect( text ).to.have.property( 'parent' ).that.is.null;
		} );
	} );

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new ViewText( 'foo' );
			text.setText( 'bar' );

			expect( text.getText() ).to.equal( 'bar' );
		} );
	} );

	describe( 'DOM-View binding', () => {
		describe( 'getCorespondingView', () => {
			it( 'should return coresponding view element based on sibling', () => {
				const domImg = document.createElement( 'img' );
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domImg );
				domP.appendChild( domText );

				const viewImg = new ViewElement( 'img' );

				viewImg.bindDomElement( domImg );

				const viewP = ViewElement.createFromDom( domP );
				const viewText = viewP.getChild( 1 );

				expect( ViewText.getCorespondingView( domText ) ).to.equal( viewText );
			} );

			it( 'should return coresponding view element based on parent', () => {
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domText );

				const viewP = ViewElement.createFromDom( domP );
				const viewText = viewP.getChild( 0 );

				viewP.bindDomElement( domP );

				expect( ViewText.getCorespondingView( domText ) ).to.equal( viewText );
			} );

			it( 'should return null if sibling is not binded', () => {
				const domImg = document.createElement( 'img' );
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domImg );
				domP.appendChild( domText );

				const viewP = ViewElement.createFromDom( domP );

				viewP.bindDomElement( domP );

				expect( ViewText.getCorespondingView( domText ) ).to.be.null;
			} );

			it( 'should return null if parent is not binded', () => {
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domText );

				expect( ViewText.getCorespondingView( domText ) ).to.be.null;
			} );
		} );

		describe( 'getCorespondingDom', () => {
			it( 'should return coresponding DOM element based on sibling', () => {
				const domImg = document.createElement( 'img' );
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domImg );
				domP.appendChild( domText );

				const viewImg = new ViewElement( 'img' );

				viewImg.bindDomElement( domImg );

				const viewP = ViewElement.createFromDom( domP );
				const viewText = viewP.getChild( 1 );

				expect( viewText.getCorespondingDom() ).to.equal( domText );
			} );

			it( 'should return coresponding DOM element based on parent', () => {
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domText );

				const viewP = ViewElement.createFromDom( domP );
				const viewText = viewP.getChild( 0 );

				viewP.bindDomElement( domP );

				expect( viewText.getCorespondingDom() ).to.equal( domText );
			} );

			it( 'should return null if sibling is not binded', () => {
				const domImg = document.createElement( 'img' );
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domImg );
				domP.appendChild( domText );

				const viewP = ViewElement.createFromDom( domP );
				const viewText = viewP.getChild( 1 );

				viewP.bindDomElement( domP );

				expect( viewText.getCorespondingDom() ).to.be.null;
			} );

			it( 'should return null if parent is not binded', () => {
				const domText = document.createTextNode( 'foo' );
				const domP = document.createElement( 'p' );

				domP.appendChild( domText );

				const viewP = ViewElement.createFromDom( domP );
				const viewText = viewP.getChild( 0 );

				expect( viewText.getCorespondingDom() ).to.be.null;
			} );
		} );
	} );
} );
