/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ViewUIElement from '../../../src/view/uielement.js';
import ViewContainer from '../../../src/view/containerelement.js';
import DomConverter from '../../../src/view/domconverter.js';
import ViewDocument from '../../../src/view/document.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DOMConverter UIElement integration', () => {
	let converter, viewDocument;

	function createUIElement( name ) {
		const element = new ViewUIElement( viewDocument, name );

		element.render = function( domDocument ) {
			const root = this.toDomElement( domDocument );
			root.innerHTML = '<p><span>foo</span> bar</p>';

			return root;
		};

		return element;
	}

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new DomConverter( viewDocument );
	} );

	describe( 'viewToDom()', () => {
		it( 'should create DOM element from UIElement', () => {
			const uiElement = new ViewUIElement( viewDocument, 'div' );
			const domElement = converter.viewToDom( uiElement );

			expect( domElement ).to.be.instanceOf( HTMLElement );
		} );

		it( 'should create DOM structure from UIElement', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement );

			expect( domElement ).to.be.instanceOf( HTMLElement );
			expect( domElement.innerHTML ).to.equal( '<p><span>foo</span> bar</p>' );
		} );

		it( 'should create DOM structure that all is mapped to single UIElement', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, { bind: true } );
			const domParagraph = domElement.childNodes[ 0 ];

			expect( converter.mapDomToView( domElement ) ).to.equal( myElement );
			expect( converter.mapDomToView( domParagraph ) ).to.equal( myElement );
			expect( converter.mapDomToView( domParagraph.childNodes[ 0 ] ) ).to.equal( myElement );
		} );
	} );

	describe( 'domToView()', () => {
		it( 'should return UIElement itself', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, { bind: true } );

			expect( converter.domToView( domElement ) ).to.equal( uiElement );
		} );

		it( 'should return UIElement for nodes inside', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.domToView( domParagraph ) ).to.equal( uiElement );
			expect( converter.domToView( domSpan ) ).to.equal( uiElement );
			expect( converter.domToView( domParagraph.childNodes[ 0 ] ) ).equal( uiElement );
			expect( converter.domToView( domSpan.childNodes[ 0 ] ) ).equal( uiElement );
		} );
	} );

	describe( 'domPositionToView()', () => {
		it( 'should convert position inside UIElement to position before it', () => {
			const uiElement = createUIElement( 'h1' );
			const container = new ViewContainer( viewDocument, 'div', null, [ new ViewContainer( viewDocument, 'div' ), uiElement ] );
			const domContainer = converter.viewToDom( container, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ], 0 );

			expect( viewPosition.parent ).to.equal( container );
			expect( viewPosition.offset ).to.equal( 1 );
		} );

		it( 'should convert position inside UIElement children to position before UIElement', () => {
			const uiElement = createUIElement( 'h1' );
			const container = new ViewContainer( viewDocument, 'div', null, [ new ViewContainer( viewDocument, 'div' ), uiElement ] );
			const domContainer = converter.viewToDom( container, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ].childNodes[ 0 ], 1 );

			expect( viewPosition.parent ).to.equal( container );
			expect( viewPosition.offset ).to.equal( 1 );
		} );
	} );

	describe( 'mapDomToView()', () => {
		it( 'should return UIElement for DOM elements inside', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, { bind: true } );

			expect( converter.mapDomToView( domElement ) ).to.equal( myElement );

			const domParagraph = domElement.childNodes[ 0 ];
			expect( converter.mapDomToView( domParagraph ) ).to.equal( myElement );

			const domSpan = domParagraph.childNodes[ 0 ];
			expect( converter.mapDomToView( domSpan ) ).to.equal( myElement );
		} );
	} );

	describe( 'findCorrespondingViewText()', () => {
		it( 'should return UIElement for DOM text inside', () => {
			const myElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( myElement, { bind: true } );

			const domText = domElement.querySelector( 'span' ).childNodes[ 0 ];
			expect( converter.findCorrespondingViewText( domText ) ).to.equal( myElement );
		} );
	} );

	describe( 'getHostViewElement()', () => {
		it( 'should return UIElement for DOM children', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.getHostViewElement( domParagraph ) ).to.equal( uiElement );
			expect( converter.getHostViewElement( domSpan ) ).to.equal( uiElement );
		} );

		it( 'should return null for element itself', () => {
			const uiElement = createUIElement( 'div' );
			const domElement = converter.viewToDom( uiElement, { bind: true } );

			expect( converter.getHostViewElement( domElement ) ).to.be.null;
		} );
	} );
} );
