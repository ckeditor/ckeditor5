/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewRawElement } from '../../../src/view/rawelement.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewDomConverter } from '../../../src/view/domconverter.js';
import { ViewDocument } from '../../../src/view/document.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DOMConverter RawElement integration', () => {
	let converter, viewDocument;

	function createRawElement( name ) {
		const element = new ViewRawElement( viewDocument, name );

		element.render = function( domElement ) {
			domElement.innerHTML = '<p><span>foo</span> bar</p>';
		};

		return element;
	}

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new ViewDomConverter( viewDocument );
	} );

	describe( 'viewToDom()', () => {
		it( 'should create a DOM element from a RawElement', () => {
			const rawElement = new ViewRawElement( viewDocument, 'div' );
			rawElement.render = () => {};
			const domElement = converter.viewToDom( rawElement );

			expect( domElement ).toBeInstanceOf( HTMLElement );
		} );

		it( 'should create a DOM structure from a RawElement', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement );

			expect( domElement ).toBeInstanceOf( HTMLElement );
			expect( domElement.innerHTML ).toBe( '<p><span>foo</span> bar</p>' );
		} );

		it( 'should create a DOM structure entirely mapped to a single RawElement', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, { bind: true } );
			const domParagraph = domElement.childNodes[ 0 ];

			expect( converter.mapDomToView( domElement ) ).toBe( myElement );
			expect( converter.mapDomToView( domParagraph ) ).toBe( myElement );
			expect( converter.mapDomToView( domParagraph.childNodes[ 0 ] ) ).toBe( myElement );
		} );
	} );

	describe( 'domToView()', () => {
		it( 'should return a RawElement', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, { bind: true } );

			expect( converter.domToView( domElement ) ).toBe( rawElement );
		} );

		it( 'should return a RawElement for all nodes inside of it', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.domToView( domParagraph ) ).toBe( rawElement );
			expect( converter.domToView( domSpan ) ).toBe( rawElement );
			expect( converter.domToView( domParagraph.childNodes[ 0 ] ) ).toBe( rawElement );
			expect( converter.domToView( domSpan.childNodes[ 0 ] ) ).toBe( rawElement );
		} );
	} );

	describe( 'domPositionToView()', () => {
		it( 'should convert a position inside a RawElement to a position before it', () => {
			const rawElement = createRawElement( 'h1' );
			const container = new ViewContainerElement(
				viewDocument, 'div', null, [ new ViewContainerElement( viewDocument, 'div' ), rawElement ]
			);
			const domContainer = converter.viewToDom( container, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ], 0 );

			expect( viewPosition.parent ).toBe( container );
			expect( viewPosition.offset ).toBe( 1 );
		} );

		it( 'should convert a position inside RawElement children to a position before it', () => {
			const rawElement = createRawElement( 'h1' );
			const container = new ViewContainerElement(
				viewDocument, 'div', null, [ new ViewContainerElement( viewDocument, 'div' ), rawElement ]
			);
			const domContainer = converter.viewToDom( container, { bind: true } );

			const viewPosition = converter.domPositionToView( domContainer.childNodes[ 1 ].childNodes[ 0 ], 1 );

			expect( viewPosition.parent ).toBe( container );
			expect( viewPosition.offset ).toBe( 1 );
		} );
	} );

	describe( 'mapDomToView()', () => {
		it( 'should return a RawElement for all DOM elements inside of it', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, { bind: true } );

			expect( converter.mapDomToView( domElement ) ).toBe( myElement );

			const domParagraph = domElement.childNodes[ 0 ];
			expect( converter.mapDomToView( domParagraph ) ).toBe( myElement );

			const domSpan = domParagraph.childNodes[ 0 ];
			expect( converter.mapDomToView( domSpan ) ).toBe( myElement );
		} );
	} );

	describe( 'findCorrespondingViewText()', () => {
		it( 'should return a RawElement for all DOM text nodes inside of it', () => {
			const myElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( myElement, { bind: true } );

			const domText = domElement.querySelector( 'span' ).childNodes[ 0 ];
			expect( converter.findCorrespondingViewText( domText ) ).toBe( myElement );
		} );
	} );

	describe( 'getHostViewElement()', () => {
		it( 'should return a RawElement for all DOM children', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, { bind: true } );

			const domParagraph = domElement.childNodes[ 0 ];
			const domSpan = domParagraph.childNodes[ 0 ];

			expect( converter.getHostViewElement( domParagraph ) ).toBe( rawElement );
			expect( converter.getHostViewElement( domSpan ) ).toBe( rawElement );
		} );

		it( 'should return "null" for the parent itself', () => {
			const rawElement = createRawElement( 'div' );
			const domElement = converter.viewToDom( rawElement, { bind: true } );

			expect( converter.getHostViewElement( domElement ) ).toBeNull();
		} );
	} );
} );
