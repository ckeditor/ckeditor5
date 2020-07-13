/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, HTMLElement */

import ViewRawElement from '../../../src/view/rawelement';
import ViewContainer from '../../../src/view/containerelement';
import DomConverter from '../../../src/view/domconverter';
import ViewDocument from '../../../src/view/document';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'DOMConverter RawElement integration', () => {
	let converter, viewDocument;

	function createRawElement( name ) {
		const element = new ViewRawElement( viewDocument, name );

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
		it( 'should create a DOM element from a RawElement', () => {
			const rawElement = new ViewRawElement( viewDocument, 'div' );
			const domElement = converter.viewToDom( rawElement, document );

			expect( domElement ).to.be.instanceOf( HTMLElement );
		} );

		it( 'should create a DOM structure from a RawElement', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, document );

			expect( domElement ).to.be.instanceOf( HTMLElement );
			expect( domElement.innerHTML ).to.equal( '<p><span>foo</span> bar</p>' );
		} );

		it( 'should create a DOM structure entirely mapped to a single RawElement', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, document, { bind: true } );
			const domParagraph = domElement.childNodes[ 0 ];

			expect( converter.mapDomToView( domElement ) ).to.equal( myElement );
			expect( converter.mapDomToView( domParagraph ) ).to.equal( myElement );
			expect( converter.mapDomToView( domParagraph.childNodes[ 0 ] ) ).to.equal( myElement );
		} );
	} );

	describe( 'domToView()', () => {
		it( 'should return a RawElement', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, document, { bind: true } );

			expect( converter.domToView( domElement ) ).to.equal( rawElement );
		} );

		it( 'should return a RawElement for all nodes inside of it', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, document, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.domToView( domParagraph ) ).to.equal( rawElement );
			expect( converter.domToView( domSpan ) ).to.equal( rawElement );
			expect( converter.domToView( domParagraph.childNodes[ 0 ] ) ).equal( rawElement );
			expect( converter.domToView( domSpan.childNodes[ 0 ] ) ).equal( rawElement );
		} );
	} );

	describe( 'domPositionToView()', () => {
		it( 'should convert a position inside a RawElement to a position before it', () => {
			const rawElement = createRawElement( 'h1' );
			const container = new ViewContainer( viewDocument, 'div', null, [ new ViewContainer( viewDocument, 'div' ), rawElement ] );
			const domContainer = converter.viewToDom( container, document, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ], 0 );

			expect( viewPosition.parent ).to.equal( container );
			expect( viewPosition.offset ).to.equal( 1 );
		} );

		it( 'should convert a position inside RawElement children to a position before it', () => {
			const rawElement = createRawElement( 'h1' );
			const container = new ViewContainer( viewDocument, 'div', null, [ new ViewContainer( viewDocument, 'div' ), rawElement ] );
			const domContainer = converter.viewToDom( container, document, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ].childNodes[ 0 ], 1 );

			expect( viewPosition.parent ).to.equal( container );
			expect( viewPosition.offset ).to.equal( 1 );
		} );
	} );

	describe( 'mapDomToView()', () => {
		it( 'should return a RawElement for all DOM elements inside of it', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, document, { bind: true } );

			expect( converter.mapDomToView( domElement ) ).to.equal( myElement );

			const domParagraph = domElement.childNodes[ 0 ];
			expect( converter.mapDomToView( domParagraph ) ).to.equal( myElement );

			const domSpan = domParagraph.childNodes[ 0 ];
			expect( converter.mapDomToView( domSpan ) ).to.equal( myElement );
		} );
	} );

	describe( 'findCorrespondingViewText()', () => {
		it( 'should return a RawElement for all DOM text nodes inside of it', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, document, { bind: true } );

			const domText = domElement.querySelector( 'span' ).childNodes[ 0 ];
			expect( converter.findCorrespondingViewText( domText ) ).to.equal( myElement );
		} );
	} );

	describe( 'getHostViewElement()', () => {
		it( 'should return a RawElement for all DOM children', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, document, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.getHostViewElement( domParagraph ) ).to.equal( rawElement );
			expect( converter.getHostViewElement( domSpan ) ).to.equal( rawElement );
		} );

		it( 'should return "null" for the parent itself', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, document, { bind: true } );

			expect( converter.getHostViewElement( domElement ) ).to.be.null;
		} );
	} );
} );
