/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewElement } from '../../../src/view/element.js';
import { ViewDocumentSelection } from '../../../src/view/documentselection.js';
import { ViewDomConverter } from '../../../src/view/domconverter.js';
import { ViewDocumentFragment } from '../../../src/view/documentfragment.js';
import { ViewDocument } from '../../../src/view/document.js';
import { INLINE_FILLER } from '../../../src/view/filler.js';

import { _parseView } from '../../../src/dev-utils/view.js';

import { createElement } from '@ckeditor/ckeditor5-utils';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DomConverter', () => {
	let converter, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new ViewDomConverter( viewDocument );
	} );

	describe( 'bindElements()', () => {
		it( 'should bind elements', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( viewDocument, 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.mapDomToView( domElement ) ).toBe( viewElement );
			expect( converter.mapViewToDom( viewElement ) ).toBe( domElement );
		} );
	} );

	describe( 'bindDocumentFragments()', () => {
		it( 'should bind document fragments', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment( viewDocument );

			converter.bindDocumentFragments( domFragment, viewFragment );

			expect( converter.mapDomToView( domFragment ) ).toBe( viewFragment );
			expect( converter.mapViewToDom( viewFragment ) ).toBe( domFragment );
		} );
	} );

	describe( 'mapDomToView()', () => {
		it( 'should return corresponding view element if element is passed', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( viewDocument, 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.mapDomToView( domElement ) ).toBe( viewElement );
		} );

		it( 'should return corresponding view document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = converter.domToView( domFragment );

			converter.bindElements( domFragment, viewFragment );

			expect( converter.mapDomToView( domFragment ) ).toBe( viewFragment );
		} );

		it( 'should return undefined if falsy value was passed', () => {
			expect( converter.mapDomToView( null ) ).toBeUndefined();
			expect( converter.mapDomToView( undefined ) ).toBeUndefined();
		} );
	} );

	describe( 'findCorrespondingViewText()', () => {
		it( 'should return corresponding view text based on sibling', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domImg, domText ] );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 1 );

			expect( converter.findCorrespondingViewText( domText ) ).toBe( viewText );
		} );

		it( 'should return corresponding view text based on parent', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			converter.bindElements( domP, viewP );

			expect( converter.findCorrespondingViewText( domText ) ).toBe( viewText );
		} );

		it( 'should return null if sibling is not bound', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domImg, domText ] );

			const viewP = converter.domToView( domP );

			converter.bindElements( domP, viewP );

			expect( converter.findCorrespondingViewText( domText ) ).toBeNull();
		} );

		it( 'should return null if sibling is not element', () => {
			const domTextFoo = document.createTextNode( 'foo' );
			const domTextBar = document.createTextNode( 'bar' );
			const domP = createElement( document, 'p', null, [ domTextFoo, domTextBar ] );

			const viewP = converter.domToView( domP );

			converter.bindElements( domP, viewP );

			expect( converter.findCorrespondingViewText( domTextBar ) ).toBeNull();
		} );

		it( 'should return null if parent is not bound', () => {
			const domText = document.createTextNode( 'foo' );
			createElement( document, 'p', null, domText );

			expect( converter.findCorrespondingViewText( domText ) ).toBeNull();
		} );

		it( 'should return null for inline filler', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domP = createElement( document, 'p', null, domFiller );

			const viewP = converter.domToView( domP );

			converter.bindElements( domP, viewP );

			expect( converter.findCorrespondingViewText( domFiller ) ).toBeNull();
		} );

		it( 'should return null if there is no text node sibling in view', () => {
			const domB = document.createElement( 'b' );
			const domI = document.createElement( 'i' );
			const domText = document.createTextNode( 'x' );
			const domP = createElement( document, 'p', null, [ domB, domText, domI ] );

			const viewP = _parseView( '<p><b></b><i></i></p>' );
			const viewB = viewP.getChild( 0 );
			const viewI = viewP.getChild( 1 );

			converter.bindElements( domP, viewP );
			converter.bindElements( domI, viewI );
			converter.bindElements( domB, viewB );

			expect( converter.findCorrespondingViewText( domText ) ).toBeNull();
		} );

		it( 'should return null if there is no child text node in view', () => {
			const domText = document.createTextNode( 'x' );
			const domP = createElement( document, 'p', null, domText );

			const viewP = _parseView( '<p></p>' );

			converter.bindElements( domP, viewP );

			expect( converter.findCorrespondingViewText( domText ) ).toBeNull();
		} );
	} );

	describe( 'mapViewToDom()', () => {
		it( 'should return corresponding DOM element if element was passed', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( viewDocument, 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.mapViewToDom( viewElement ) ).toBe( domElement );
		} );

		it( 'should return corresponding DOM document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment( viewDocument );

			converter.bindElements( domFragment, viewFragment );

			expect( converter.mapViewToDom( viewFragment ) ).toBe( domFragment );
		} );

		it( 'should return undefined if wrong parameter is passed', () => {
			expect( converter.mapViewToDom( null ) ).toBeUndefined();
		} );
	} );

	describe( 'findCorrespondingDomText()', () => {
		it( 'should return corresponding DOM text based on sibling', () => {
			const domImg = document.createElement( 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domImg );
			domP.appendChild( domText );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 1 );

			expect( converter.findCorrespondingDomText( viewText ) ).toBe( domText );
		} );

		it( 'should return corresponding DOM text based on parent', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			converter.bindElements( domP, viewP );

			expect( converter.findCorrespondingDomText( viewText ) ).toBe( domText );
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

			expect( converter.findCorrespondingDomText( viewText ) ).toBeNull();
		} );

		it( 'should return null if parent is not bound', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = document.createElement( 'p' );

			domP.appendChild( domText );

			const viewP = converter.domToView( domP );
			const viewText = viewP.getChild( 0 );

			expect( converter.findCorrespondingDomText( viewText ) ).toBeNull();
		} );

		it( 'should return null if there is no previous sibling and parent', () => {
			const domText = document.createTextNode( 'foo' );
			const viewText = converter.domToView( domText );

			expect( converter.findCorrespondingDomText( viewText ) ).toBeNull();
		} );
	} );

	describe( 'bindFakeSelection', () => {
		let domEl, selection, viewElement;

		beforeEach( () => {
			viewElement = new ViewElement( viewDocument );
			domEl = document.createElement( 'div' );
			selection = new ViewDocumentSelection( viewElement, 'in' );
			converter.bindFakeSelection( domEl, selection );
		} );

		it( 'should bind DOM element to selection', () => {
			const bindSelection = converter.fakeSelectionToView( domEl );
			expect( bindSelection ).not.toBeUndefined();
			expect( bindSelection.isEqual( selection ) ).toBe( true );
		} );

		it( 'should keep a copy of selection', () => {
			const selectionCopy = new ViewDocumentSelection( selection );

			selection._setTo( new ViewElement( viewDocument ), 'in', { backward: true } );
			const bindSelection = converter.fakeSelectionToView( domEl );

			expect( bindSelection ).not.toBe( selection );
			expect( bindSelection.isEqual( selection ) ).toBe( false );
			expect( bindSelection.isEqual( selectionCopy ) ).toBe( true );
		} );
	} );

	describe( 'unbindDomElement', () => {
		it( 'should unbind elements', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( viewDocument, 'p' );

			converter.bindElements( domElement, viewElement );

			expect( converter.mapDomToView( domElement ) ).toBe( viewElement );
			expect( converter.mapViewToDom( viewElement ) ).toBe( domElement );

			converter.unbindDomElement( domElement );

			expect( converter.mapDomToView( domElement ) ).toBeUndefined();
			expect( converter.mapViewToDom( viewElement ) ).toBeUndefined();
		} );

		it( 'should unbind element\'s child nodes', () => {
			const domElement = document.createElement( 'p' );
			const domChild = document.createElement( 'span' );
			domElement.appendChild( domChild );

			const viewElement = new ViewElement( viewDocument, 'p' );
			const viewChild = new ViewElement( viewDocument, 'span' );

			converter.bindElements( domElement, viewElement );
			converter.bindElements( domChild, viewChild );

			expect( converter.mapDomToView( domChild ) ).toBe( viewChild );
			expect( converter.mapViewToDom( viewChild ) ).toBe( domChild );

			converter.unbindDomElement( domElement );

			expect( converter.mapDomToView( domChild ) ).toBeUndefined();
			expect( converter.mapViewToDom( viewChild ) ).toBeUndefined();
		} );

		it( 'should do nothing if there are no elements bind', () => {
			const domElement = document.createElement( 'p' );
			const viewElement = new ViewElement( viewDocument, 'p' );

			expect( converter.mapDomToView( domElement ) ).toBeUndefined();
			expect( converter.mapViewToDom( viewElement ) ).toBeUndefined();

			converter.unbindDomElement( domElement );

			expect( converter.mapDomToView( domElement ) ).toBeUndefined();
			expect( converter.mapViewToDom( viewElement ) ).toBeUndefined();
		} );
	} );
} );
