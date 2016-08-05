/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, domconverter, browser-only */

import ViewElement from '/ckeditor5/engine/view/element.js';
import DomConverter from '/ckeditor5/engine/view/domconverter.js';
import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER } from '/ckeditor5/engine/view/filler.js';

import { parse, stringify } from '/tests/engine/_utils/view.js';

import count from '/ckeditor5/utils/count.js';
import createElement from '/ckeditor5/utils/dom/createelement.js';

describe( 'DomConverter', () => {
	let converter;

	before( () => {
		converter = new DomConverter();
	} );

	describe( 'domToView', () => {
		it( 'should create tree of view elements from DOM elements', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.childCount ).to.equal( 2 );
			expect( viewP.getChild( 0 ).name ).to.equal( 'img' );
			expect( viewP.getChild( 1 ).data ).to.equal( 'foo' );

			expect( converter.getCorrespondingDom( viewP ) ).to.not.equal( domP );
			expect( converter.getCorrespondingDom( viewP.getChild( 0 ) ) ).to.equal( domImg );
		} );

		it( 'should create tree of view elements from DOM elements and bind elements', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewP = converter.domToView( domP, { bind: true } );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.childCount ).to.equal( 2 );
			expect( viewP.getChild( 0 ).name ).to.equal( 'img' );
			expect( viewP.getChild( 1 ).data ).to.equal( 'foo' );

			expect( converter.getCorrespondingDom( viewP ) ).to.equal( domP );
			expect( converter.getCorrespondingDom( viewP.getChild( 0 ) ) ).to.equal( domP.childNodes[ 0 ] );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domText ] );

			const viewP = converter.domToView( domP, { bind: true } );

			expect( viewP.childCount ).to.equal( 1 );

			const viewText = viewP.getChild( 0 );
			expect( viewText.data ).to.equal( 'நிலைக்கு' );

			expect( converter.getCorrespondingDom( viewP ) ).to.equal( domP );
			expect( converter.getCorrespondingDom( viewP.getChild( 0 ) ) ).to.equal( domP.childNodes[ 0 ] );
		} );

		it( 'should create tree of view elements from DOM element without children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP, { withChildren: false } );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.childCount ).to.equal( 0 );
			expect( converter.getCorrespondingDom( viewP ) ).to.not.equal( domP );
		} );

		it( 'should create view document fragment from DOM document fragment', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domFragment = document.createDocumentFragment();

			domFragment.appendChild( domImg );
			domFragment.appendChild( domText );

			const viewFragment = converter.domToView( domFragment, { bind: true } );

			expect( viewFragment ).to.be.an.instanceof( ViewDocumentFragment );
			expect( viewFragment.childCount ).to.equal( 2 );
			expect( viewFragment.getChild( 0 ).name ).to.equal( 'img' );
			expect( viewFragment.getChild( 1 ).data ).to.equal( 'foo' );

			expect( converter.getCorrespondingDom( viewFragment ) ).to.equal( domFragment );
			expect( converter.getCorrespondingDom( viewFragment.getChild( 0 ) ) ).to.equal( domFragment.childNodes[ 0 ] );
		} );

		it( 'should create view document fragment from DOM document fragment without children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domFragment = document.createDocumentFragment();

			domFragment.appendChild( domImg );
			domFragment.appendChild( domText );

			const viewImg = new ViewElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const viewFragment = converter.domToView( domFragment, { withChildren: false } );

			expect( viewFragment ).to.be.an.instanceof( ViewDocumentFragment );

			expect( viewFragment.childCount ).to.equal( 0 );
			expect( converter.getCorrespondingDom( viewFragment ) ).to.not.equal( domFragment );
		} );

		it( 'should return already bind document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment();

			converter.bindDocumentFragments( domFragment, viewFragment );

			const viewFragment2 = converter.domToView( domFragment );

			expect( viewFragment2 ).to.equal( viewFragment );
		} );

		it( 'should return null for block filler', () => {
			const domFiller = converter.blockFiller( document );
			const viewFiller = converter.domToView( domFiller );

			expect( viewFiller ).to.be.null;
		} );
	} );

	describe( 'domChildrenToView', () => {
		it( 'should convert children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domImg, domText ] );

			const viewChildren = Array.from( converter.domChildrenToView( domP ) );

			expect( viewChildren.length ).to.equal( 2 );
			expect( stringify( viewChildren[ 0 ] ) ).to.equal( '<img></img>' );
			expect( stringify( viewChildren[ 1 ] ) ).to.equal( 'foo' );
		} );

		it( 'should skip filler', () => {
			const domFiller = converter.blockFiller( document );
			const domP = createElement( document, 'p', null, domFiller );

			const viewChildren = Array.from( converter.domChildrenToView( domP ) );

			expect( viewChildren.length ).to.equal( 0 );
		} );

		it( 'should pass options', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domB, domText ] );

			const viewChildren = Array.from( converter.domChildrenToView( domP, { withChildren: false }  ) );

			expect( viewChildren.length ).to.equal( 2 );
			expect( stringify( viewChildren[ 0 ] ) ).to.equal( '<b></b>' );
			expect( stringify( viewChildren[ 1 ] ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'domPositionToView', () => {
		it( 'should converter position in text', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );

			const viewPosition = converter.domPositionToView( domText, 2 );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>fo{}o<b>bar</b></p>' );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', null, [ domText ] );

			const viewP = parse( '<p>நிலைக்கு</p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domText, 4 );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>நிலை{}க்கு</p>' );
		} );

		it( 'should converter position in element', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>foo[]<b>bar</b></p>' );
		} );

		it( 'should converter position at the beginning', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewP = parse( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domP, 0 );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>[]foo</p>' );
		} );

		it( 'should converter position inside block filler', () => {
			const converter = new DomConverter( { blockFiller: NBSP_FILLER } );
			const domFiller = NBSP_FILLER( document );
			const domP = createElement( document, 'p', null, domFiller );

			const viewP = parse( '<p></p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domFiller, 0 );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should converter position inside inline filler', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, domFiller );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = parse( '<p>foo<b></b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domFiller, INLINE_FILLER_LENGTH );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>foo<b>[]</b></p>' );
		} );

		it( 'should converter position inside inline filler with text', () => {
			const domFiller = document.createTextNode( INLINE_FILLER + 'bar' );
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, domFiller );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domFiller, INLINE_FILLER_LENGTH + 2 );

			expect( viewPosition.offset ).to.equal( 2 );
			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>foo<b>ba{}r</b></p>' );
		} );

		it( 'should converter position inside inline filler with text at the beginning', () => {
			const domFiller = document.createTextNode( INLINE_FILLER + 'bar' );
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, domFiller );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domFiller, INLINE_FILLER_LENGTH - 1 );

			expect( viewPosition.offset ).to.equal( 0 );
			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>foo<b>{}bar</b></p>' );
		} );

		it( 'should converter position at the end', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewP = parse( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( stringify( viewP, viewPosition ) ).to.equal( '<p>foo[]</p>' );
		} );

		it( 'should return null if there is no corresponding parent node', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewPosition = converter.domPositionToView( domP, 0 );

			expect( viewPosition ).to.be.null;
		} );

		it( 'should return null if there is no corresponding sibling node', () => {
			const domB = createElement( document, 'b', null, 'bar' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domB, domText ] );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( viewPosition ).to.be.null;
		} );

		it( 'should return null if there is no corresponding text node', () => {
			const domText = document.createTextNode( 'foo' );

			const viewPosition = converter.domPositionToView( domText, 1 );

			expect( viewPosition ).to.be.null;
		} );
	} );

	describe( 'domRangeToView', () => {
		it( 'should converter DOM range', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const domRange = new Range();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const viewRange = converter.domRangeToView( domRange );

			expect( stringify( viewP, viewRange ) ).to.equal( '<p>f{oo<b>ba}r</b></p>' );
		} );

		it( 'should return null if start or end is null', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			createElement( document, 'p', null, [ domFoo, domB ] );

			const domRange = new Range();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const viewRange = converter.domRangeToView( domRange );

			expect( viewRange ).to.be.null;
		} );
	} );

	describe( 'domSelectionToView', () => {
		it( 'should converter selection', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			document.body.appendChild( domP );

			const domRange = new Range();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).to.equal( 1 );
			expect( stringify( viewP, viewSelection.getFirstRange() ) ).to.equal( '<p>f{oo<b>ba}r</b></p>' );
		} );

		it( 'should converter empty selection to empty selection', () => {
			const domSelection = document.getSelection();
			domSelection.removeAllRanges();

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).to.equal( 0 );
		} );

		it( 'should not add null ranges', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			document.body.appendChild( domP );

			const domRange = new Range();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).to.equal( 0 );
		} );
	} );
} );
