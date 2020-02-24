/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ViewElement from '../../../src/view/element';
import ViewDocument from '../../../src/view/document';
import ViewDocumentSelection from '../../../src/view/documentselection';
import DomConverter from '../../../src/view/domconverter';
import ViewDocumentFragment from '../../../src/view/documentfragment';
import { BR_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER } from '../../../src/view/filler';
import { StylesProcessor } from '../../../src/view/stylesmap';
import { parse, stringify } from '../../../src/dev-utils/view';

import count from '@ckeditor/ckeditor5-utils/src/count';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

describe( 'DomConverter', () => {
	let converter, viewDocument, stylesProcessor;

	before( () => {
		stylesProcessor = new StylesProcessor();
		viewDocument = new ViewDocument( stylesProcessor );
		converter = new DomConverter( viewDocument );
	} );

	describe( 'domToView()', () => {
		it( 'should create tree of view elements from DOM elements', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.childCount ).to.equal( 2 );
			expect( viewP.getChild( 0 ).name ).to.equal( 'img' );
			expect( viewP.getChild( 1 ).data ).to.equal( 'foo' );

			expect( converter.mapViewToDom( viewP ) ).to.not.equal( domP );
			expect( converter.mapViewToDom( viewP.getChild( 0 ) ) ).to.equal( domImg );
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

			expect( converter.mapViewToDom( viewP ) ).to.equal( domP );
			expect( converter.mapViewToDom( viewP.getChild( 0 ) ) ).to.equal( domP.childNodes[ 0 ] );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domText ] );

			const viewP = converter.domToView( domP, { bind: true } );

			expect( viewP.childCount ).to.equal( 1 );

			const viewText = viewP.getChild( 0 );
			expect( viewText.data ).to.equal( 'நிலைக்கு' );

			expect( converter.mapViewToDom( viewP ) ).to.equal( domP );
			expect( converter.findCorrespondingDomText( viewP.getChild( 0 ) ) ).to.equal( domP.childNodes[ 0 ] );
		} );

		it( 'should create tree of view elements from DOM element without children', () => {
			const domImg = createElement( document, 'img' );
			const domText = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', { 'class': 'foo' }, [ domImg, domText ] );

			const viewImg = new ViewElement( viewDocument, 'img' );

			converter.bindElements( domImg, viewImg );

			const viewP = converter.domToView( domP, { withChildren: false } );

			expect( viewP ).to.be.an.instanceof( ViewElement );
			expect( viewP.name ).to.equal( 'p' );

			expect( viewP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( count( viewP.getAttributeKeys() ) ).to.equal( 1 );

			expect( viewP.childCount ).to.equal( 0 );
			expect( converter.mapViewToDom( viewP ) ).to.not.equal( domP );
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

			expect( converter.mapViewToDom( viewFragment ) ).to.equal( domFragment );
			expect( converter.mapViewToDom( viewFragment.getChild( 0 ) ) ).to.equal( domFragment.childNodes[ 0 ] );
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

			expect( viewFragment ).to.be.an.instanceof( ViewDocumentFragment );

			expect( viewFragment.childCount ).to.equal( 0 );
			expect( converter.mapViewToDom( viewFragment ) ).to.not.equal( domFragment );
		} );

		it( 'should return already bind document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment();

			converter.bindDocumentFragments( domFragment, viewFragment );

			const viewFragment2 = converter.domToView( domFragment );

			expect( viewFragment2 ).to.equal( viewFragment );
		} );

		it( 'should return null for block filler', () => {
			// eslint-disable-next-line new-cap
			const domFiller = BR_FILLER( document );

			expect( converter.domToView( domFiller ) ).to.be.null;
		} );

		it( 'should return null for empty text node', () => {
			const textNode = document.createTextNode( '' );

			expect( converter.domToView( textNode ) ).to.be.null;
		} );

		it( 'should return null for a comment', () => {
			const comment = document.createComment( 'abc' );

			expect( converter.domToView( comment ) ).to.be.null;
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

				expect( viewDiv.childCount ).to.equal( 2 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'at the end of block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo ' )
					] ),
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo ' )
					] ),
					document.createTextNode( ' ' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 2 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'after a block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( ' ' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'after a block element (new line)', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( '\n' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'after a block element (carriage return)', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( '\r' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'after a block element (tab)', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] ),
					document.createTextNode( '\t' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
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

				expect( viewDiv.childCount ).to.equal( 2 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data )
					.to.equal( 'x\fx\vx\u00a0x\u1680x\u2000x\u200ax\u2028x\u2029x\u202fx\u205fx\u3000x\ufeffx' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data )
					.to.equal( 'x\f\vx\u00a0\u1680x\u2000\u200ax\u2028\u2029x\u202f\u205fx\u3000\ufeffx' );
			} );

			it( 'before a block element', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( ' ' ),
					createElement( document, 'p', {}, [
						document.createTextNode( ' foo' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'before a block element (new line)', () => {
				const domDiv = createElement( document, 'div', {}, [
					document.createTextNode( '\n' ),
					createElement( document, 'p', {}, [
						document.createTextNode( 'foo' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
			} );

			it( 'after a <br>', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo' ),
					createElement( document, 'br' ),
					document.createTextNode( ' bar' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).to.equal( 3 );
				expect( viewP.getChild( 2 ).data ).to.equal( 'bar' );
			} );

			it( 'after a <br> – two spaces', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo' ),
					createElement( document, 'br' ),
					document.createTextNode( ' \u00a0bar' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).to.equal( 3 );
				expect( viewP.getChild( 2 ).data ).to.equal( ' bar' );
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

				expect( viewP.childCount ).to.equal( 3 );
				expect( viewP.getChild( 2 ).data ).to.equal( 'bar' );
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

				expect( viewP.childCount ).to.equal( 3 );
				expect( viewP.getChild( 2 ).getChild( 0 ).data ).to.equal( 'bar' );
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

				expect( viewP.childCount ).to.equal( 5 );
				expect( viewP.getChild( 2 ).data ).to.equal( 'foo ' );
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

				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'f o o' );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).to.equal( 'fo o' );
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

				expect( viewDiv.childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( 'f o o' );
			} );

			function test( inputTexts, output ) {
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

					expect( data ).to.equal( output );
				} );
			}

			// At the beginning.
			test( '_x', ' x' );
			test( '_ x', '  x' );
			test( '_ _x', '   x' );
			test( '_ _ x', '    x' );

			// At the end.
			test( 'x_', 'x ' );
			test( 'x _', 'x  ' );
			test( 'x __', 'x   ' );
			test( 'x _ _', 'x    ' );

			// In the middle.
			test( 'x x', 'x x' );
			test( 'x _x', 'x  x' );
			test( 'x _ x', 'x   x' );
			test( 'x _ _x', 'x    x' );

			// Complex.
			test( '_x_', ' x ' );
			test( '_ x _x _', '  x  x  ' );
			test( '_ _x x _', '   x x  ' );
			test( '_ _x x __', '   x x   ' );
			test( '_ _x _ _x_', '   x    x ' );
			test( '_', ' ' );

			// With hard &nbsp;
			test( '_x', ' x' );
			test( '__x', ' _x' );
			test( '___x', ' __x' );
			test( '__ x', ' _ x' );

			test( 'x_', 'x ' );
			test( 'x__', 'x_ ' );
			test( 'x___', 'x__ ' );

			test( 'x_x', 'x_x' );
			test( 'x___x', 'x___x' );
			test( 'x____x', 'x____x' );
			test( 'x__ x', 'x__ x' );
			test( 'x___ x', 'x___ x' );
			test( 'x_ _x', 'x_  x' );
			test( 'x __x', 'x  _x' );
			test( 'x _ x', 'x   x' );
			test( 'x __ _x', 'x  _  x' );

			// Two text nodes.
			test( [ 'x', 'y' ], 'xy' );
			test( [ 'x ', 'y' ], 'x y' );
			test( [ 'x _', 'y' ], 'x  y' );
			test( [ 'x __', 'y' ], 'x   y' );
			test( [ 'x _  _', 'y' ], 'x    y' );

			test( [ 'x', ' y' ], 'x y' );
			test( [ 'x_', ' y' ], 'x  y' );
			test( [ 'x _', ' y' ], 'x   y' );
			test( [ 'x __', ' y' ], 'x    y' );
			test( [ 'x _ _', ' y' ], 'x     y' );

			test( [ 'x', ' _y' ], 'x  y' );
			test( [ 'x_', ' _y' ], 'x   y' );
			test( [ 'x _', ' _y' ], 'x    y' );
			test( [ 'x __', ' _y' ], 'x     y' );
			test( [ 'x _ _', ' _y' ], 'x      y' );

			// Some tests with hard &nbsp;
			test( [ 'x', '_y' ], 'x_y' );
			test( [ 'x_', 'y' ], 'x_y' );
			test( [ 'x__', ' y' ], 'x_  y' );
			test( [ 'x_ _', ' y' ], 'x_   y' );

			it( 'not in preformatted blocks', () => {
				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'pre', {}, [
						document.createTextNode( '   foo\n   foo  ' )
					] )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.getChild( 0 ).getChild( 0 ).data ).to.equal( '   foo\n   foo  ' );
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

				expect( viewDiv.getChild( 1 ).name ).to.equal( 'span' );
				expect( viewDiv.getChild( 1 ).childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).to.equal( ' ' );
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

				expect( viewDiv.getChild( 1 ).name ).to.equal( 'span' );
				expect( viewDiv.getChild( 1 ).childCount ).to.equal( 1 );
				expect( viewDiv.getChild( 1 ).getChild( 0 ).data ).to.equal( '\u00a0' );
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

				expect( viewDiv.getChild( 0 ).name ).to.equal( 'span' );
				expect( viewDiv.getChild( 0 ).childCount ).to.equal( 2 );

				expect( viewDiv.getChild( 0 ).getChild( 1 ).name ).to.equal( 'span' );
				expect( viewDiv.getChild( 0 ).getChild( 1 ).childCount ).to.equal( 1 );

				expect( viewDiv.getChild( 0 ).getChild( 1 ).getChild( 0 ).data ).to.equal( '\u00a0' );
			} );

			// While we render `X&nbsp;<br>X`, `X <br>X` is ok too – the space needs to be preserved.
			it( 'not before a <br>', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo ' ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).to.equal( 2 );
				expect( viewP.getChild( 0 ).data ).to.equal( 'foo ' );
			} );

			it( 'not before a <br> (space+nbsp)', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo \u00a0' ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).to.equal( 2 );
				expect( viewP.getChild( 0 ).data ).to.equal( 'foo  ' );
			} );

			it( 'before a <br> (space+space=>space)', () => {
				const domP = createElement( document, 'p', {}, [
					document.createTextNode( 'foo  ' ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).to.equal( 2 );
				expect( viewP.getChild( 0 ).data ).to.equal( 'foo ' );
			} );

			it( 'not before a <br> – when text before that <br> is nested', () => {
				const domP = createElement( document, 'p', {}, [
					createElement( document, 'b', {}, [
						document.createTextNode( 'foo ' )
					] ),
					createElement( document, 'br' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).to.equal( 2 );
				expect( viewP.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo ' );
			} );

			//
			// See also whitespace-handling-integration.js.
			//
		} );

		describe( 'clearing auto filler', () => {
			it( 'should remove inline filler when converting dom to view', () => {
				const text = document.createTextNode( INLINE_FILLER + 'foo' );
				const view = converter.domToView( text );

				expect( view.data ).to.equal( 'foo' );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/692.
			it( 'should not remove space after inline filler if previous node nor next node does not exist', () => {
				const text = document.createTextNode( INLINE_FILLER + ' ' );
				const view = converter.domToView( text );

				expect( view.data ).to.equal( ' ' );
			} );

			it( 'should convert non breaking space to normal space after inline filler', () => {
				const text = document.createTextNode( INLINE_FILLER + '\u00A0' );
				const view = converter.domToView( text );

				expect( view.data ).to.equal( ' ' );
			} );
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
			// eslint-disable-next-line new-cap
			const domFiller = BR_FILLER( document );
			const domP = createElement( document, 'p', null, domFiller );

			const viewChildren = Array.from( converter.domChildrenToView( domP ) );

			expect( viewChildren.length ).to.equal( 0 );
		} );

		it( 'should pass options', () => {
			const domText = document.createTextNode( 'foo' );
			const domB = createElement( document, 'b', null, 'bar' );
			const domP = createElement( document, 'p', null, [ domB, domText ] );

			const viewChildren = Array.from( converter.domChildrenToView( domP, { withChildren: false } ) );

			expect( viewChildren.length ).to.equal( 2 );
			expect( stringify( viewChildren[ 0 ] ) ).to.equal( '<b></b>' );
			expect( stringify( viewChildren[ 1 ] ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'domPositionToView()', () => {
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
			const converter = new DomConverter( viewDocument, { blockFillerMode: 'nbsp' } );
			const domFiller = NBSP_FILLER( document ); // eslint-disable-line new-cap
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

	describe( 'domRangeToView()', () => {
		it( 'should convert DOM range', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 1 ) );

			const domRange = document.createRange();
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

			const domRange = document.createRange();
			domRange.setStart( domFoo, 1 );
			domRange.setEnd( domBar, 2 );

			const viewRange = converter.domRangeToView( domRange );

			expect( viewRange ).to.be.null;
		} );
	} );

	describe( 'domSelectionToView()', () => {
		it( 'should convert selection', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domBar = document.createTextNode( 'bar' );
			const domB = createElement( document, 'b', null, domBar );
			const domP = createElement( document, 'p', null, [ domFoo, domB ] );

			const viewP = parse( '<p>foo<b>bar</b></p>' );

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

			expect( viewSelection.rangeCount ).to.equal( 1 );
			expect( stringify( viewP, viewSelection.getFirstRange() ) ).to.equal( '<p>f{oo<b>ba}r</b></p>' );

			domP.remove();
		} );

		it( 'should convert empty selection to empty selection', () => {
			const domSelection = document.getSelection();
			domSelection.removeAllRanges();

			const viewSelection = converter.domSelectionToView( domSelection );

			expect( viewSelection.rangeCount ).to.equal( 0 );
		} );

		it( 'should handle selection direction', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, [ domFoo ] );

			const viewP = parse( '<p>foo</p>' );

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

			expect( viewSelection.rangeCount ).to.equal( 1 );
			expect( viewSelection.anchor.offset ).to.equal( 2 );
			expect( viewSelection.focus.offset ).to.equal( 1 );
			expect( viewSelection.isBackward ).to.be.true;

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

			expect( viewSelection.rangeCount ).to.equal( 0 );

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

			expect( bindViewSelection.isEqual( viewSelection ) ).to.be.true;

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

			expect( bindViewSelection.isEqual( viewSelection ) ).to.be.true;

			domContainer.remove();
		} );
	} );
} );
