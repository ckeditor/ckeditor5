/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ViewElement } from '../../../src/view/element.js';
import { ViewUIElement } from '../../../src/view/uielement.js';
import { ViewDocument } from '../../../src/view/document.js';
import { ViewDocumentSelection } from '../../../src/view/documentselection.js';
import { ViewSelection } from '../../../src/view/selection.js';
import { ViewDomConverter } from '../../../src/view/domconverter.js';
import { ViewDocumentFragment } from '../../../src/view/documentfragment.js';
import { BR_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER, MARKED_NBSP_FILLER } from '../../../src/view/filler.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';
import { _parseView, _stringifyView } from '../../../src/dev-utils/view.js';

import { count, createElement, env } from '@ckeditor/ckeditor5-utils';

describe( 'DomConverter', () => {
	let converter, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new ViewDomConverter( viewDocument );
	} );

	describe( 'domToView()', () => {
		it( 'should create tree of view elements from DOM elements', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );

			expect( viewP ).toBeInstanceOf( ViewElement );
			expect( viewP.name ).toBe( 'p' );

			expect( viewP.getAttribute( 'class' ) ).toBe( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).toBe( 1 );

			expect( viewP.childCount ).toBe( 2 );
			expect( viewP.getChild( 0 ).name ).toBe( 'img' );
			expect( viewP.getChild( 1 ).data ).toBe( 'foo' );

			expect( converter.mapViewToDom( viewP ) ).not.toBe( domP );
			expect( converter.mapViewToDom( viewP.getChild( 0 ) ) ).toBe( domImg );
		} );

		it( 'should create tree of view elements from DOM elements and bind elements', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewP = converter.domToView( domP, { bind: true } );

			expect( viewP ).toBeInstanceOf( ViewElement );
			expect( viewP.name ).toBe( 'p' );

			expect( viewP.getAttribute( 'class' ) ).toBe( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).toBe( 1 );

			expect( viewP.childCount ).toBe( 2 );
			expect( viewP.getChild( 0 ).name ).toBe( 'img' );
			expect( viewP.getChild( 1 ).data ).toBe( 'foo' );

			expect( converter.mapViewToDom( viewP ) ).toBe( domP );
			expect( converter.mapViewToDom( viewP.getChild( 0 ) ) ).toBe( domP.childNodes[ 0 ] );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domText ] );

			const viewP = converter.domToView( domP, { bind: true } );

			expect( viewP.childCount ).toBe( 1 );

			const viewText = viewP.getChild( 0 );
			expect( viewText.data ).toBe( 'நிலைக்கு' );

			expect( converter.mapViewToDom( viewP ) ).toBe( domP );
			expect( converter.findCorrespondingDomText( viewP.getChild( 0 ) ) ).toBe( domP.childNodes[ 0 ] );
		} );

		it( 'should create tree of view elements from DOM element without children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP, { withChildren: false } );

			expect( viewP ).toBeInstanceOf( ViewElement );
			expect( viewP.name ).toBe( 'p' );

			expect( viewP.getAttribute( 'class' ) ).toBe( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).toBe( 1 );

			expect( viewP.childCount ).toBe( 0 );
			expect( converter.mapViewToDom( viewP ) ).not.toBe( domP );
		} );

		it( 'should create view document fragment from DOM document fragment', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domFragment = document.createDocumentFragment();

			domFragment.appendChild( domImg );
			domFragment.appendChild( domText );

			const viewFragment = converter.domToView( domFragment, { bind: true } );

			expect( viewFragment ).toBeInstanceOf( ViewDocumentFragment );
			expect( viewFragment.childCount ).toBe( 2 );
			expect( viewFragment.getChild( 0 ).name ).toBe( 'img' );
			expect( viewFragment.getChild( 1 ).data ).toBe( 'foo' );

			expect( converter.mapViewToDom( viewFragment ) ).toBe( domFragment );
			expect( converter.mapViewToDom( viewFragment.getChild( 0 ) ) ).toBe( domFragment.childNodes[ 0 ] );
		} );

		it( 'should create view document fragment from DOM document fragment without children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domFragment = document.createDocumentFragment();

			domFragment.appendChild( domImg );
			domFragment.appendChild( domText );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewFragment = converter.domToView( domFragment, { withChildren: false } );

			expect( viewFragment ).toBeInstanceOf( ViewDocumentFragment );

			expect( viewFragment.childCount ).toBe( 0 );
			expect( converter.mapViewToDom( viewFragment ) ).not.toBe( domFragment );
		} );

		it( 'should return already bind document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment();

			converter.bindDocumentFragments( domFragment, viewFragment );

			const viewFragment2 = converter.domToView( domFragment );

			expect( viewFragment2 ).toBe( viewFragment );
		} );

		it( 'should return null for block filler', () => {
			// eslint-disable-next-line new-cap
			const domFiller = BR_FILLER( document );

			expect( converter.domToView( domFiller ) ).toBeNull();
		} );

		it( 'should ignore a block filler inside a paragraph', () => {
			// eslint-disable-next-line new-cap
			const domFiller = BR_FILLER( document );
			const domP = createElement( document, 'p', undefined, [ domFiller ] );

			const viewP = converter.domToView( domP );
			expect( viewP.is( 'element', 'p' ) ).toBe( true );
			expect( viewP.childCount ).toBe( 0 );
		} );

		it( 'should return null for empty text node', () => {
			const textNode = document.createTextNode( '' );

			expect( converter.domToView( textNode ) ).toBeNull();
		} );

		it( 'should create UIElement for comment', () => {
			const domComment = document.createComment( 'abc' );

			const viewComment = converter.domToView( domComment );

			expect( viewComment ).toBeInstanceOf( ViewUIElement );
			expect( viewComment.name ).toBe( '$comment' );

			expect( viewComment.getCustomProperty( '$rawContent' ) ).toBe( 'abc' );

			expect( converter.mapViewToDom( viewComment ) ).not.toBe( domComment );
		} );

		it( 'should create UIElement for comment and bind elements', () => {
			const domComment = document.createComment( 'abc' );

			const viewComment = converter.domToView( domComment, { bind: true } );

			expect( viewComment ).toBeInstanceOf( ViewUIElement );
			expect( viewComment.name ).toBe( '$comment' );

			expect( viewComment.getCustomProperty( '$rawContent' ) ).toBe( 'abc' );

			expect( converter.mapViewToDom( viewComment ) ).toBe( domComment );
		} );

		it( 'should return `null` for a comment when the `skipComments` option is set to `true`', () => {
			const domComment = document.createComment( 'abc' );

			const viewComment = converter.domToView( domComment, { skipComments: true } );

			expect( viewComment ).toBeNull();
		} );

		it( 'should set attributes in the same order as in the DOM', () => {
			const domP = createElement( document, 'p', { 'data-foo': 'a', 'data-bar': 'b' } );
			const viewP = converter.domToView( domP );

			expect( viewP ).toBeInstanceOf( ViewElement );
			expect( viewP.name ).toBe( 'p' );

			const attributes = Array.from( viewP.getAttributes() );

			expect( attributes.length ).toBe( 2 );
			expect( attributes ).toEqual( [
				[ 'data-foo', 'a' ],
				[ 'data-bar', 'b' ]
			] );
		} );

		describe( 'it should clear whitespaces', () => {
			it( 'at the beginning of block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( ' ' ),
					createElement( document, 'p', {}, [
						document.createTextNode( ' foo' )
					] ),
					createElement( document, 'p', {}, [
						document.createTextNode( ' foo' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 2 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			it( 'at the end of block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo ' )
					] ),
					createElement( document, 'p', {}, [
						document.createTextNode( 'bar ' )
					] ),
					document.createTextNode( ' ' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 2 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).toBe( 'bar' );
			} );

			it( 'after a block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( ' ' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			it( 'after a block element (new line)', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( '\n' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			it( 'after a block element (carriage return)', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( '\r' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			it( 'after a block element (tab)', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( '\t' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			// See https://github.com/ckeditor/ckeditor5-engine/issues/822#issuecomment-311670249
			it( 'but preserve all except " \\n\\r\\t"', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'x\fx\vx\u00a0x\u1680x\u2000x\u200ax\u2028x\u2029x\u202fx\u205fx\u3000x\ufeffx' )
					] ),
					createElement( document, 'p', {}, [
						// x<two spaces>x because it behaved differently than "x<space>x" when I've been fixing this
						document.createTextNode( 'x\f\vx\u00a0\u1680x\u2000\u200ax\u2028\u2029x\u202f\u205fx\u3000\ufeffx' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 2 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data )
					.toBe( 'x\fx\vx\u00a0x\u1680x\u2000x\u200ax\u2028x\u2029x\u202fx\u205fx\u3000x\ufeffx' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data )
					.toBe( 'x\f\vx\u00a0\u1680x\u2000\u200ax\u2028\u2029x\u202f\u205fx\u3000\ufeffx' );
			} );

			it( 'before a block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( ' ' ),
					createElement( document, 'p', {}, [
						document.createTextNode( ' foo' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			it( 'before a block element (new line)', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( '\n' ),
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo' );
			} );

			it( 'after a <br>', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo' ),
					createElement( document, 'br' ),
					document.createTextNode( ' bar' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 3 );
				expect( viewP.getChild( 2 ).data ).toBe( 'bar' );
			} );

			it( 'after a <br> – two spaces', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo' ),
					createElement( document, 'br' ),
					document.createTextNode( ' \u00a0bar' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 3 );
				expect( viewP.getChild( 2 ).data ).toBe( ' bar' );
			} );

			// This TC ensures that the algorithm stops on <br>.
			// If not, situations like https://github.com/ckeditor/ckeditor5/issues/1024#issuecomment-393109558 might occur.
			it( 'after a <br> – when <br> is preceeded with a nbsp', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo\u00a0' ),
					createElement( document, 'br' ),
					document.createTextNode( ' bar' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 3 );
				expect( viewP.getChild( 2 ).data ).toBe( 'bar' );
			} );

			it( 'after a <br> – when text after that <br> is nested', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo' ),
					createElement( document, 'br' ),
					createElement( document, 'b', {}, [
						document.createTextNode( ' bar' )
					] )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 3 );
				expect( viewP.getChild( 2 ).getChild( 0 ).data ).toBe( 'bar' );
			} );

			it( 'between <br>s - trim only the left boundary', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'x' ),
					createElement( document, 'br' ),
					document.createTextNode( ' foo ' ),
					createElement( document, 'br' ),
					document.createTextNode( 'x' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 5 );
				expect( viewP.getChild( 2 ).data ).toBe( 'foo ' );
			} );

			it( 'multiple consecutive whitespaces changed to one', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( '             f    o  o' )
					] ),
					createElement( document, 'p', {}, [
						document.createTextNode( 'fo  o   ' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'f o o' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).toBe( 'fo o' );
			} );

			it( 'multiple consecutive whitespaces changed to one (tab, new line, carriage return)', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( '\n\n \t\r\n' ),
					createElement( document, 'p', {}, [
						document.createTextNode( 'f\n\t\r\n\to\n\n\no' )
					] ),
					document.createTextNode( '\n\n \t\r\n' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( 'f o o' );
			} );

			function testTexts( inputTexts, output ) {
				if ( typeof inputTexts == 'string' ) {
					inputTexts = [ inputTexts ];
				}

				it( 'spaces in a text node: ' + inputTexts.join( '|' ) + ' -> ' + output, () => {
					const domElement = createElement( document, 'div', {}, [] );

					for ( const text of inputTexts ) {
						domElement.appendChild( document.createTextNode( text.replace( /_/g, '\u00A0' ) ) );
					}

					const viewElement = converter.domToView( domElement );

					let data = '';

					for ( const child of viewElement.getChildren() ) {
						data += child.data.replace( /\u00A0/g, '_' );
					}

					expect( data ).toBe( output );
				} );
			}

			// At the beginning.
			testTexts( '_x', ' x' );
			testTexts( '_ x', '  x' );
			testTexts( '_ _x', '   x' );
			testTexts( '_ _ x', '    x' );

			// At the end.
			testTexts( 'x_', 'x ' );
			testTexts( 'x _', 'x  ' );
			testTexts( 'x __', 'x   ' );
			testTexts( 'x _ _', 'x    ' );

			// In the middle.
			testTexts( 'x x', 'x x' );
			testTexts( 'x _x', 'x  x' );
			testTexts( 'x _ x', 'x   x' );
			testTexts( 'x _ _x', 'x    x' );

			// Complex.
			testTexts( '_x_', ' x ' );
			testTexts( '_ x _x _', '  x  x  ' );
			testTexts( '_ _x x _', '   x x  ' );
			testTexts( '_ _x x __', '   x x   ' );
			testTexts( '_ _x _ _x_', '   x    x ' );
			testTexts( '_', ' ' );

			// With hard &nbsp;
			testTexts( '_x', ' x' );
			testTexts( '__x', ' _x' );
			testTexts( '___x', ' __x' );
			testTexts( '__ x', ' _ x' );

			testTexts( 'x_', 'x ' );
			testTexts( 'x__', 'x_ ' );
			testTexts( 'x___', 'x__ ' );

			testTexts( 'x_x', 'x_x' );
			testTexts( 'x___x', 'x___x' );
			testTexts( 'x____x', 'x____x' );
			testTexts( 'x__ x', 'x__ x' );
			testTexts( 'x___ x', 'x___ x' );
			testTexts( 'x_ _x', 'x_  x' );
			testTexts( 'x __x', 'x  _x' );
			testTexts( 'x _ x', 'x   x' );
			testTexts( 'x __ _x', 'x  _  x' );

			// Two text nodes.
			testTexts( [ 'x', 'y' ], 'xy' );
			testTexts( [ 'x ', 'y' ], 'x y' );
			testTexts( [ 'x _', 'y' ], 'x  y' );
			testTexts( [ 'x __', 'y' ], 'x   y' );
			testTexts( [ 'x _  _', 'y' ], 'x    y' );

			testTexts( [ 'x', ' y' ], 'x y' );
			testTexts( [ 'x_', ' y' ], 'x  y' );
			testTexts( [ 'x _', ' y' ], 'x   y' );
			testTexts( [ 'x __', ' y' ], 'x    y' );
			testTexts( [ 'x _ _', ' y' ], 'x     y' );

			testTexts( [ 'x', ' _y' ], 'x  y' );
			testTexts( [ 'x_', ' _y' ], 'x   y' );
			testTexts( [ 'x _', ' _y' ], 'x    y' );
			testTexts( [ 'x __', ' _y' ], 'x     y' );
			testTexts( [ 'x _ _', ' _y' ], 'x      y' );

			// Some tests with hard &nbsp;
			testTexts( [ 'x', '_y' ], 'x_y' );
			testTexts( [ 'x_', 'y' ], 'x_y' );
			testTexts( [ 'x__', ' y' ], 'x_  y' );
			testTexts( [ 'x_ _', ' y' ], 'x_   y' );

			it( 'not in preformatted blocks', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'pre', {}, [
						document.createTextNode( '   foo\n   foo  ' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).toBe( '   foo\n   foo  ' );
			} );

			// https://github.com/ckeditor/ckeditor5-clipboard/issues/2#issuecomment-310417731
			it( 'not in span between two words (space)', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( 'word' ),
					createElement( document, 'span', {}, [
						document.createTextNode( ' ' )
					] ),
					document.createTextNode( 'word' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.getChild( 1 ).name ).toBe( 'span' );
				expect( viewDiv.getChild( 1 ).childCount ).toBe( 1 );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).toBe( ' ' );
			} );

			// https://github.com/ckeditor/ckeditor5-clipboard/issues/2#issuecomment-310417731
			it( 'not in span between two words (nbsp)', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( 'word' ),
					createElement( document, 'span', {}, [
						document.createTextNode( '\u00a0' )
					] ),
					document.createTextNode( 'word' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.getChild( 1 ).name ).toBe( 'span' );
				expect( viewDiv.getChild( 1 ).childCount ).toBe( 1 );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).toBe( '\u00a0' );
			} );

			// https://github.com/ckeditor/ckeditor5-clipboard/issues/2#issuecomment-310417731
			it( 'not in a Chrome\'s paste-like content', () => {
				// Like:
				// <span style="color: rgb(0, 0, 0); font-family: Times;">This is the<span>\u00a0</span></span>
				// <a href="url" style="font-family: Times; font-size: medium;">third developer preview</a>
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'span', {}, [
						document.createTextNode( 'word' ),
						createElement( document, 'span', {}, [
							document.createTextNode( '\u00a0' )
						] )
					] ),
					createElement( document, 'a', {}, [
						document.createTextNode( 'word' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.getChild( 0 ).name ).toBe( 'span' );
				expect( viewDiv.getChild( 0 ).childCount ).toBe( 2 );

				expect( viewDiv.getChild( 0 ).getChild( 1 ).name ).toBe( 'span' );
				expect( viewDiv.getChild( 0 ).getChild( 1 ).childCount ).toBe( 1 );

				expect( viewDiv.getChild( 0 ).getChild( 1 ).getChild( 0 ).data ).toBe( '\u00a0' );
			} );

			// While we render `X&nbsp;<br>X`, `X <br>X` is ok too – the space needs to be preserved.
			it( 'not before a <br>', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo ' ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 2 );
				expect( viewP.getChild( 0 ).data ).toBe( 'foo ' );
			} );

			it( 'not before a <br> (space+nbsp)', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo \u00a0' ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 2 );
				expect( viewP.getChild( 0 ).data ).toBe( 'foo  ' );
			} );

			it( 'before a <br> (space+space=>space)', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo  ' ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 2 );
				expect( viewP.getChild( 0 ).data ).toBe( 'foo ' );
			} );

			it( 'not before a <br> – when text before that <br> is nested', () => {
				const domP = createElement( document, 'p', {}, [
					createElement( document, 'b', {}, [
						document.createTextNode( 'foo ' )
					] ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 2 );
				expect( viewP.getChild( 0 ).getChild( 0 ).data ).toBe( 'foo ' );
			} );

			//
			// See also whitespace-handling-integration.js.
			//
		} );

		describe( 'clearing auto filler', () => {
			it( 'should remove inline filler when converting dom to view', () => {
				const text = document.createTextNode( INLINE_FILLER + 'foo' );
				const view = converter.domToView( text );

				expect( view.data ).toBe( 'foo' );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/692.
			it( 'should not remove space after inline filler if previous node nor next node does not exist', () => {
				const text = document.createTextNode( INLINE_FILLER + ' ' );
				const view = converter.domToView( text );

				expect( view.data ).toBe( ' ' );
			} );

			it( 'should convert non breaking space to normal space after inline filler', () => {
				const text = document.createTextNode( INLINE_FILLER + '\u00A0' );
				const view = converter.domToView( text );

				expect( view.data ).toBe( ' ' );
			} );
		} );

		describe( 'block filler handling (markedNbsp mode)', () => {
			it( 'should mark parent block as having a block filler and remove the filler span when the span has a parent element', () => {
				// eslint-disable-next-line new-cap
				const domFillerSpan = MARKED_NBSP_FILLER( document );
				const domP = createElement( document, 'p', null, [ domFillerSpan ] );

				const converter2 = new ViewDomConverter( viewDocument, { blockFillerMode: 'markedNbsp' } );
				const viewP = converter2.domToView( domP );

				// The filler span should have been removed from the view paragraph.
				expect( viewP.childCount ).toBe( 0 );
				// The paragraph should be marked as having a block filler.
				expect( viewP.getCustomProperty( '$hasBlockFiller' ) ).toBe( true );
			} );

			it( 'should not crash when the marked-nbsp filler span has no parent element', () => {
				// eslint-disable-next-line new-cap
				const domFillerSpan = MARKED_NBSP_FILLER( document );

				const converter2 = new ViewDomConverter( viewDocument, { blockFillerMode: 'markedNbsp' } );

				// The span is the root element being converted (no parent), so `node.parent.parent` is null.
				// The converter should handle this gracefully \u2014 the text is cleared but no custom property is set.
				const viewSpan = converter2.domToView( domFillerSpan );

				expect( viewSpan.childCount ).toBe( 0 );
			} );
		} );
	} );

	describe( 'domChildrenToView', () => {
		it( 'should convert children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domImg, domText ] );

			const viewChildren = Array.from( converter.domChildrenToView( domP ) );

			expect( viewChildren.length ).toBe( 2 );
			expect( _stringifyView( viewChildren[ 0 ] ) ).toBe( '<img></img>' );
			expect( _stringifyView( viewChildren[ 1 ] ) ).toBe( 'foo' );
		} );

		it( 'should skip filler', () => {
			// eslint-disable-next-line new-cap
			const domFiller = BR_FILLER( document );
			const domP = createElement( document, 'p', null, domFiller );

			const viewChildren = Array.from( converter.domChildrenToView( domP ) );

			expect( viewChildren.length ).toBe( 0 );
		} );

		it( 'should pass options', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domB, domText ] );

			const viewChildren = Array.from( converter.domChildrenToView( domP, { withChildren: false } ) );

			expect( viewChildren.length ).toBe( 2 );
			expect( _stringifyView( viewChildren[ 0 ] ) ).toBe( '<b></b>' );
			expect( _stringifyView( viewChildren[ 1 ] ) ).toBe( 'foo' );
		} );
	} );

	describe( 'domPositionToView()', () => {
		it( 'should converter position in text', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = _parseView( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );

			const viewPosition = converter.domPositionToView( domText, 2 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>fo{}o<b>bar</b></p>' );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', null, [ domText ] );

			const viewP = _parseView( '<p>நிலைக்கு</p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domText, 4 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>நிலை{}க்கு</p>' );
		} );

		it( 'should converter position in element', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = _parseView( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>foo[]<b>bar</b></p>' );
		} );

		it( 'should converter position at the beginning', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewP = _parseView( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domP, 0 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>[]foo</p>' );
		} );

		it( 'should converter position inside block filler', () => {
			const converter = new ViewDomConverter( viewDocument, { blockFillerMode: 'nbsp' } );
			const domFiller = NBSP_FILLER( document ); // eslint-disable-line new-cap
			const domP = createElement( document, 'p', null, domFiller );

			const viewP = _parseView( '<p></p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domFiller, 0 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>[]</p>' );
		} );

		it( 'should converter position inside inline filler', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, domFiller );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = _parseView( '<p>foo<b></b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domFiller, INLINE_FILLER_LENGTH );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>foo<b>[]</b></p>' );
		} );

		it( 'should converter position inside inline filler with text', () => {
			const domFiller = document.createTextNode( INLINE_FILLER + 'bar' );
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, domFiller );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = _parseView( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domFiller, INLINE_FILLER_LENGTH + 2 );

			expect( viewPosition.offset ).toBe( 2 );
			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>foo<b>ba{}r</b></p>' );
		} );

		it( 'should converter position inside inline filler with text at the beginning', () => {
			const domFiller = document.createTextNode( INLINE_FILLER + 'bar' );
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, domFiller );
			const domP = createElement( document, 'p', null, [ domText, domB ] );

			const viewP = _parseView( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domFiller, INLINE_FILLER_LENGTH - 1 );

			expect( viewPosition.offset ).toBe( 0 );
			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>foo<b>{}bar</b></p>' );
		} );

		it( 'should converter position at the end', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewP = _parseView( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>foo[]</p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/12575.
		it( 'should convert position between inline filler and br element', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domBr = createElement( document, 'br' );
			const domP = createElement( document, 'p', null, [ domFiller, domBr ] );

			const viewP = _parseView( '<p><br/></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domBr, viewP.getChild( 0 ) );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>[]<br></br></p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/12575.
		it( 'should convert position between inline filler and br element (multiple br elements)', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domBr1 = createElement( document, 'br' );
			const domBr2 = createElement( document, 'br' );
			const domP = createElement( document, 'p', null, [ domBr1, domFiller, domBr2 ] );

			const viewP = _parseView( '<p><br/><br/></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domBr1, viewP.getChild( 0 ) );
			converter.bindElements( domBr2, viewP.getChild( 1 ) );

			const viewPosition = converter.domPositionToView( domP, 2 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p><br></br>[]<br></br></p>' );
		} );

		it( 'should convert position after a block filler', () => {
			const domFiller = BR_FILLER( document ); // eslint-disable-line new-cap
			const domP = createElement( document, 'p', null, [ domFiller ] );

			const viewP = _parseView( '<p></p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( _stringifyView( viewP, viewPosition ) ).toBe( '<p>[]</p>' );
		} );

		it( 'should not crash if offset does not exist', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domP = createElement( document, 'p', null, [ domFiller ] );

			const viewP = _parseView( '<p></p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = converter.domPositionToView( domP, 100 );

			expect( viewPosition ).toBeNull();
			expect( _stringifyView( viewP ) ).toBe( '<p></p>' );
		} );

		it( 'should return null if there is no corresponding parent node', () => {
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domText );

			const viewPosition = converter.domPositionToView( domP, 0 );

			expect( viewPosition ).toBeNull();
		} );

		it( 'should return null if there is no corresponding sibling node', () => {
			const domB = createElement( document, 'b', null, 'bar' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domB, domText ] );

			const viewPosition = converter.domPositionToView( domP, 1 );

			expect( viewPosition ).toBeNull();
		} );

		it( 'should return null if there is no corresponding text node', () => {
			const domText = document.createTextNode( 'foo' );

			const viewPosition = converter.domPositionToView( domText, 1 );

			expect( viewPosition ).toBeNull();
		} );
	} );

	describe( 'domRangeToView()', () => {
		it( 'should convert DOM range', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			const viewP = _parseView( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const viewRange = converter.domRangeToView( domRange );

			expect( _stringifyView( viewP, viewRange ) ).toBe( '<p>f{oo<b>ba}r</b></p>' );
		} );

		it( 'should return null if start or end is null', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			createElement( document, 'p', null, [ domFoo, domB ] );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const viewRange = converter.domRangeToView( domRange );

			expect( viewRange ).toBeNull();
		} );
	} );

	describe( 'domSelectionToView()', () => {
		it( 'should convert selection', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			const viewP = _parseView( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 1 );
			expect( _stringifyView( viewP, viewSelection.getFirstRange() ) ).toBe( '<p>f{oo<b>ba}r</b></p>' );

			domP.remove();
		} );

		it( 'should convert empty selection to empty selection', () => {
			const domSelection = document.getSelection();
			domSelection.removeAllRanges();

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 0 );
		} );

		it( 'should handle selection direction (forward, same node)', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domFoo ] );

			const viewP = _parseView( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.collapse( true );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );
			domSelection.extend( domFoo, 2 );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 1 );
			expect( viewSelection.anchor.offset ).toBe( 1 );
			expect( viewSelection.focus.offset ).toBe( 2 );
			expect( viewSelection.isBackward ).toBe( false );

			domP.remove();
		} );

		it( 'should handle selection direction (forward, different node)', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, [ domFoo ] );
			const domI = createElement( document, 'i', null, [ domBar ] );
			const domP = createElement( document, 'p', null, [ domB, domI ] );

			const viewP = _parseView( '<p><b>foo</b><i>bar</i></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );
			converter.bindElements( domI, viewP.getChild( 1 ) );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 2 );
			domRange.collapse( true );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );
			domSelection.extend( domBar, 1 );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 1 );
			expect( viewSelection.anchor.parent.parent.name ).toBe( 'b' );
			expect( viewSelection.anchor.offset ).toBe( 2 );
			expect( viewSelection.focus.parent.parent.name ).toBe( 'i' );
			expect( viewSelection.focus.offset ).toBe( 1 );
			expect( viewSelection.isBackward ).toBe( false );

			domP.remove();
		} );

		it( 'should handle selection direction (backward, same node)', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domFoo ] );

			const viewP = _parseView( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 2 );
			domRange.collapse( true );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );
			domSelection.extend( domFoo, 1 );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 1 );
			expect( viewSelection.anchor.offset ).toBe( 2 );
			expect( viewSelection.focus.offset ).toBe( 1 );
			expect( viewSelection.isBackward ).toBe( true );

			domP.remove();
		} );

		it( 'should handle selection direction (backward, different node)', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, [ domFoo ] );
			const domI = createElement( document, 'i', null, [ domBar ] );
			const domP = createElement( document, 'p', null, [ domB, domI ] );

			const viewP = _parseView( '<p><b>foo</b><i>bar</i></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );
			converter.bindElements( domI, viewP.getChild( 1 ) );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domBar, 1 );
			domRange.collapse( true );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );
			domSelection.extend( domFoo, 2 );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 1 );
			expect( viewSelection.anchor.parent.parent.name ).toBe( 'i' );
			expect( viewSelection.anchor.offset ).toBe( 1 );
			expect( viewSelection.focus.parent.parent.name ).toBe( 'b' );
			expect( viewSelection.focus.offset ).toBe( 2 );
			expect( viewSelection.isBackward ).toBe( true );

			domP.remove();
		} );

		// https://github.com/ckeditor/ckeditor5/issues/12375
		// It happens on Safari that current selection doesn't make any sense.
		it( 'should not throw when selection.focusOffset is greater than the number of elements', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domFoo ] );

			const viewP = _parseView( '<p>foo</p>' );

			converter.bindElements( domP, viewP );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.collapse( true );

			const domSelection = {
				rangeCount: 1,
				isCollapsed: false,
				anchorNode: domFoo,
				anchorOffset: 1,
				focusNode: domFoo,
				focusOffset: 100,

				getRangeAt() { return domRange; }
			};

			let viewSelection;

			expect( () => {
				viewSelection = converter.domSelectionToView( domSelection );
			} ).not.toThrow();

			expect( viewSelection.rangeCount ).toBe( 1 );
			expect( viewSelection.isBackward ).toBe( false );

			domP.remove();
		} );

		it( 'should not add null ranges', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			document.body.appendChild( domP );

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).toBe( 0 );

			domP.remove();
		} );

		it( 'should return fake selection', () => {
			const domContainer = document.createElement( 'div' );
			const domSelection = document.getSelection();
			domContainer.innerHTML = 'fake selection container';
			document.body.appendChild( domContainer );

			const viewSelection = new ViewDocumentSelection( new ViewElement( viewDocument ), 'in' );
			converter.bindFakeSelection( domContainer, viewSelection );

			const domRange = document.createRange();
			domRange.selectNodeContents( domContainer );
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );

			const bindViewSelection = converter.domSelectionToView( domSelection );

			expect( bindViewSelection.isEqual( viewSelection ) ).toBe( true );

			domContainer.remove();
		} );

		it( 'should return fake selection if selection is placed inside text node', () => {
			const domContainer = document.createElement( 'div' );
			const domSelection = document.getSelection();
			domContainer.innerHTML = 'fake selection container';
			document.body.appendChild( domContainer );

			const viewSelection = new ViewDocumentSelection( new ViewElement( viewDocument ), 'in' );
			converter.bindFakeSelection( domContainer, viewSelection );

			const domRange = document.createRange();
			domRange.selectNodeContents( domContainer.firstChild );
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );

			const bindViewSelection = converter.domSelectionToView( domSelection );

			expect( bindViewSelection.isEqual( viewSelection ) ).toBe( true );

			domContainer.remove();
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/9635.
		describe( 'restricted objects in Firefox', () => {
			it( 'not throw if selection is anchored in the restricted object', () => {
				vi.spyOn( env, 'isGecko', 'get' ).mockReturnValue( true );

				const domFoo = document.createTextNode( 'foo' );
				const domP = createElement( document, 'p', null, [ domFoo ] );

				const viewP = _parseView( '<p>foo</p>' );

				converter.bindElements( domP, viewP );

				document.body.appendChild( domP );

				const domRange = document.createRange();
				domRange.setStart( domFoo, 1 );
				domRange.setEnd( domFoo, 2 );

				const domSelection = document.getSelection();
				domSelection.removeAllRanges();
				domSelection.addRange( domRange );

				const viewSelection = converter.domSelectionToView( domSelection );

				expect( viewSelection.rangeCount ).toBe( 1 );
				expect( _stringifyView( viewP, viewSelection.getFirstRange() ) ).toBe( '<p>f{o}o</p>' );

				// Now we know that there should be a valid view range. So let's test if the DOM node throws an error.
				vi.spyOn( domFoo, Symbol.toStringTag, 'get' ).mockImplementation( () => {
					throw new Error( 'Permission denied to access property Symbol.toStringTag' );
				} );

				let result = null;

				expect( () => {
					result = converter.domSelectionToView( domSelection );
				} ).not.toThrow();

				expect( result instanceof ViewSelection ).toBe( true );
				expect( result.rangeCount ).toBe( 0 );

				domP.remove();
			} );

			it( 'should not check if restricted object on non-Gecko browsers', () => {
				vi.spyOn( env, 'isGecko', 'get' ).mockReturnValue( false );

				const domFoo = document.createTextNode( 'foo' );
				const domP = createElement( document, 'p', null, [ domFoo ] );

				const viewP = _parseView( '<p>foo</p>' );

				converter.bindElements( domP, viewP );

				document.body.appendChild( domP );

				const domRange = document.createRange();
				domRange.setStart( domFoo, 1 );
				domRange.setEnd( domFoo, 2 );

				const domSelection = document.getSelection();
				domSelection.removeAllRanges();
				domSelection.addRange( domRange );

				const viewSelection = converter.domSelectionToView( domSelection );

				expect( viewSelection.rangeCount ).toBe( 1 );
				expect( _stringifyView( viewP, viewSelection.getFirstRange() ) ).toBe( '<p>f{o}o</p>' );

				domP.remove();
			} );

			it( 'should convert empty selection to empty selection (in Gecko)', () => {
				vi.spyOn( env, 'isGecko', 'get' ).mockReturnValue( true );

				const domSelection = document.getSelection();
				domSelection.removeAllRanges();

				const viewSelection = converter.domSelectionToView( domSelection );

				expect( viewSelection.rangeCount ).toBe( 0 );
			} );
		} );
	} );
} );
