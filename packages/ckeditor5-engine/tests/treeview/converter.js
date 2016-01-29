/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import ViewElement from '/ckeditor5/core/treeview/element.js';
import ViewText from '/ckeditor5/core/treeview/text.js';
import Converter from '/ckeditor5/core/treeview/converter.js';

const getIteratorCount = coreTestUtils.getIteratorCount;

describe( 'converter', () => {
	let converter;

	before( () => {
		converter = new Converter();
	} );

	describe( 'bindElements', () => {
		it( 'should bind elements', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.getCorrespondingView( domElement ) ).to.equal( viewElement );
			expect( converter.getCorrespondingDom( viewElement ) ).to.equal( domElement );
		} );
	} );

	describe( 'compareNodes', () => {
		it( 'should return false for nodes not matching types', () => {
			const domElement = document.createElement( 'p' );
			const viewText = new ViewText( 'foo' );

			expect( converter.compareNodes( domElement, viewText ) ).to.be.false;
		} );

		it( 'should return true for bound elements', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.compareNodes( domElement, viewElement ) ).to.be.true;
		} );

		it( 'should return true for the same texts', () => {
			const domText = document.createTextNode( 'foo' );
			const viewText = new ViewText( 'foo' );

			expect( converter.compareNodes( domText, viewText ) ).to.be.true;
		} );
	} );

	describe( 'domToView', () => {
		it( 'should create tree of view elements from DOM elements', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.setAttribute( 'class', 'foo' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( getIteratorCount( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.getChildCount() ).to.equal( 2 );
			expect( viewP.getChild( 0 ).name ).to.equal( 'img' );
			expect( viewP.getChild( 1 ).data ).to.equal( 'foo' );

			expect( converter.getCorrespondingDom( viewP ) ).to.not.equal( domP );
			expect( converter.getCorrespondingDom( viewP.getChild( 0 ) ) ).to.equal( domImg );
		} );

		it( 'should create tree of view elements from DOM elements and bind elements', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.setAttribute( 'class', 'foo' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewP = converter.domToView( domP, { bind: true } );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( getIteratorCount( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.getChildCount() ).to.equal( 2 );
			expect( viewP.getChild( 0 ).name ).to.equal( 'img' );
			expect( viewP.getChild( 1 ).data ).to.equal( 'foo' );

			expect( converter.getCorrespondingDom( viewP ) ).to.equal( domP );
			expect( converter.getCorrespondingDom( viewP.getChild( 0 ) ) ).to.equal( domP.childNodes[ 0 ] );
		} );

		it( 'should create tree of view elements from DOM element without children', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.setAttribute( 'class', 'foo' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP, { withChildren: false } );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( getIteratorCount( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.getChildCount() ).to.equal( 0 );
			expect( converter.getCorrespondingDom( viewP ) ).to.not.equal( domP );
		} );
	} );

	describe( 'viewToDom', () => {
		it( 'should create tree of DOM elements from view elements', () => {
			const viewImg = new ViewElement( 'img' );
			const viewText = new ViewText( 'foo' );
			const viewP = new ViewElement( 'p' );

			viewP.setAttribute( 'class', 'foo' );

			viewP.appendChildren( viewImg );
			viewP.appendChildren( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domP = converter.viewToDom( viewP, document );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.getCorrespondingView( domP ) ).not.to.equal( viewP );
			expect( converter.getCorrespondingView( domP.childNodes[ 0 ] ) ).to.equal( viewImg );
		} );

		it( 'should create tree of DOM elements from view elements and bind elements', () => {
			const viewImg = new ViewElement( 'img' );
			const viewText = new ViewText( 'foo' );
			const viewP = new ViewElement( 'p' );

			viewP.setAttribute( 'class', 'foo' );

			viewP.appendChildren( viewImg );
			viewP.appendChildren( viewText );

			const domP = converter.viewToDom( viewP, document, { bind: true } );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.getCorrespondingView( domP ) ).to.equal( viewP );
			expect( converter.getCorrespondingView( domP.childNodes[ 0 ] ) ).to.equal( viewP.getChild( 0 ) );
		} );

		it( 'should create tree of DOM elements from view element without children', () => {
			const viewImg = new ViewElement( 'img' );
			const viewText = new ViewText( 'foo' );
			const viewP = new ViewElement( 'p' );

			viewP.setAttribute( 'class', 'foo' );

			viewP.appendChildren( viewImg );
			viewP.appendChildren( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domP = converter.viewToDom( viewP, document, { withChildren: false } );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 0 );
			expect( converter.getCorrespondingView( domP ) ).not.to.equal( viewP );
		} );
	} );

	describe( 'getCorrespondingView', () => {
		it( 'should return corresponding view element if element is passed', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.getCorrespondingView( domElement ) ).to.equal( viewElement );
		} );

		it( 'should return corresponding view text if text is passed', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingView( domText ) ).to.equal( viewText );
		} );
	} );

	describe( 'getCorrespondingViewElement', () => {
		it( 'should return corresponding view element', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.getCorrespondingViewElement( domElement ) ).to.equal( viewElement );
		} );
	} );

	describe( 'getCorrespondingViewText', () => {
		it( 'should return corresponding view text based on sibling', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 1 );

			expect( converter.getCorrespondingViewText( domText ) ).to.equal( viewText );
		} );

		it( 'should return corresponding view text based on parent', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingViewText( domText ) ).to.equal( viewText );
		} );

		it( 'should return null if sibling is not bound', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewP = converter.domToView( domP );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingViewText( domText ) ).to.be.null;
		} );

		it( 'should return null if sibling is not element', () => {
			const domTextFoo = document.createTextNode( 'foo' );
			const domTextBar = document.createTextNode( 'bar' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domTextFoo );
			domP.appendChild( domTextBar );

			const viewP = converter.domToView( domP );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingViewText( domTextBar ) ).to.be.null;
		} );

		it( 'should return null if parent is not bound', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			expect( converter.getCorrespondingViewText( domText ) ).to.be.null;
		} );
	} );

	describe( 'getCorrespondingDom', () => {
		it( 'should return corresponding DOM element if element was passed', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.getCorrespondingDom( viewElement ) ).to.equal( domElement );
		} );

		it( 'should return corresponding DOM text if text was passed', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingDom( viewText ) ).to.equal( domText );
		} );
	} );

	describe( 'getCorrespondingDomElement', () => {
		it( 'should return corresponding DOM element', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.getCorrespondingDomElement( viewElement ) ).to.equal( domElement );
		} );
	} );

	describe( 'getCorrespondingDomText', () => {
		it( 'should return corresponding DOM text based on sibling', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 1 );

			expect( converter.getCorrespondingDomText( viewText ) ).to.equal( domText );
		} );

		it( 'should return corresponding DOM text based on parent', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingDomText( viewText ) ).to.equal( domText );
		} );

		it( 'should return null if sibling is not bound', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 1 );

			converter.bindElements( domP, viewP );

			expect( converter.getCorrespondingDomText( viewText ) ).to.be.null;
		} );

		it( 'should return null if parent is not bound', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			expect( converter.getCorrespondingDomText( viewText ) ).to.be.null;
		} );
	} );
} );
