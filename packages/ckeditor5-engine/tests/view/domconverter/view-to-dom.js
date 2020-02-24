/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Range, DocumentFragment, HTMLElement, document, Text */

import ViewText from '../../../src/view/text';
import ViewElement from '../../../src/view/element';
import ViewPosition from '../../../src/view/position';
import ViewContainerElement from '../../../src/view/containerelement';
import ViewAttributeElement from '../../../src/view/attributeelement';
import ViewEmptyElement from '../../../src/view/emptyelement';
import DomConverter from '../../../src/view/domconverter';
import ViewDocumentFragment from '../../../src/view/documentfragment';
import ViewDocument from '../../../src/view/document';
import { INLINE_FILLER, INLINE_FILLER_LENGTH } from '../../../src/view/filler';

import { parse } from '../../../src/dev-utils/view';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'DomConverter', () => {
	let converter, viewDocument, stylesProcessor;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();
		viewDocument = new ViewDocument( stylesProcessor );
		converter = new DomConverter( viewDocument );
	} );

	describe( 'viewToDom()', () => {
		it( 'should create tree of DOM elements from view elements', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

			viewP._appendChild( viewImg );
			viewP._appendChild( viewText );

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

			expect( converter.mapDomToView( domP ) ).not.to.equal( viewP );
			expect( converter.mapDomToView( domP.childNodes[ 0 ] ) ).to.equal( viewImg );
		} );

		it( 'should create tree of DOM elements from view elements and bind elements', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

			viewP._appendChild( viewImg );
			viewP._appendChild( viewText );

			const domP = converter.viewToDom( viewP, document, { bind: true } );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domP ) ).to.equal( viewP );
			expect( converter.mapDomToView( domP.childNodes[ 0 ] ) ).to.equal( viewP.getChild( 0 ) );
		} );

		it( 'should support unicode', () => {
			const viewText = new ViewText( viewDocument, 'நிலைக்கு' );
			const viewP = new ViewElement( viewDocument, 'p', null, viewText );

			const domP = converter.viewToDom( viewP, document, { bind: true } );

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'நிலைக்கு' );

			expect( converter.mapDomToView( domP ) ).to.equal( viewP );
			expect( converter.findCorrespondingViewText( domP.childNodes[ 0 ] ) ).to.equal( viewP.getChild( 0 ) );
		} );

		it( 'should create tree of DOM elements from view element without children', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );

			viewP._appendChild( viewImg );
			viewP._appendChild( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domP = converter.viewToDom( viewP, document, { withChildren: false } );

			expect( domP ).to.be.an.instanceof( HTMLElement );
			expect( domP.tagName ).to.equal( 'P' );

			expect( domP.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domP.attributes.length ).to.equal( 1 );

			expect( domP.childNodes.length ).to.equal( 0 );
			expect( converter.mapDomToView( domP ) ).not.to.equal( viewP );
		} );

		it( 'should create DOM document fragment from view document fragment and bind elements', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewFragment = new ViewDocumentFragment( viewDocument );

			viewFragment._appendChild( viewImg );
			viewFragment._appendChild( viewText );

			const domFragment = converter.viewToDom( viewFragment, document, { bind: true } );

			expect( domFragment ).to.be.an.instanceof( DocumentFragment );
			expect( domFragment.childNodes.length ).to.equal( 2 );
			expect( domFragment.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domFragment.childNodes[ 1 ].data ).to.equal( 'foo' );

			expect( converter.mapDomToView( domFragment ) ).to.equal( viewFragment );
			expect( converter.mapDomToView( domFragment.childNodes[ 0 ] ) ).to.equal( viewFragment.getChild( 0 ) );
		} );

		it( 'should create DOM document fragment from view document without children', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewFragment = new ViewDocumentFragment( viewDocument );

			viewFragment._appendChild( viewImg );
			viewFragment._appendChild( viewText );

			const domImg = document.createElement( 'img' );

			converter.bindElements( domImg, viewImg );

			const domFragment = converter.viewToDom( viewFragment, document, { withChildren: false } );

			expect( domFragment ).to.be.an.instanceof( DocumentFragment );

			expect( domFragment.childNodes.length ).to.equal( 0 );
			expect( converter.mapDomToView( domFragment ) ).not.to.equal( viewFragment );
		} );

		it( 'should return already bind document fragment', () => {
			const domFragment = document.createDocumentFragment();
			const viewFragment = new ViewDocumentFragment( viewDocument );

			converter.bindDocumentFragments( domFragment, viewFragment );

			const domFragment2 = converter.viewToDom( viewFragment, document );

			expect( domFragment2 ).to.equal( domFragment );
		} );

		it( 'should create DOM text node from view text node', () => {
			const viewTextNode = new ViewText( viewDocument, 'foo' );
			const domTextNode = converter.viewToDom( viewTextNode, document );

			expect( domTextNode ).to.be.instanceof( Text );
			expect( domTextNode.data ).to.equal( 'foo' );
		} );

		it( 'should create namespaced elements', () => {
			const namespace = 'http://www.w3.org/2000/svg';
			const viewSvg = new ViewElement( viewDocument, 'svg', { xmlns: namespace } );

			const domSvg = converter.viewToDom( viewSvg, document );

			expect( domSvg.createSVGRect ).to.be.a( 'function' );
		} );

		describe( 'it should convert spaces to &nbsp;', () => {
			it( 'at the beginning of each container element', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, ' foo' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'bar' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, ' xxx' ) )
				] );

				const domDiv = converter.viewToDom( viewDiv, document );

				expect( domDiv.innerHTML ).to.equal( '<p>&nbsp;foo</p><p>bar</p><p>&nbsp;xxx</p>' );
			} );

			it( 'at the end of each container element', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'foo ' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'bar' ) ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, 'xxx ' ) )
				] );

				const domDiv = converter.viewToDom( viewDiv, document );

				expect( domDiv.innerHTML ).to.equal( '<p>foo&nbsp;</p><p>bar</p><p>xxx&nbsp;</p>' );
			} );

			it( 'when there are multiple spaces next to each other or between attribute elements', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewText( viewDocument, 'x  x   x x ' ),
					new ViewAttributeElement( viewDocument, 'b', null, new ViewText( viewDocument, ' x ' ) ),
					new ViewAttributeElement( viewDocument, 'i', null,
						new ViewAttributeElement( viewDocument, 'b', null,
							new ViewAttributeElement( viewDocument, 'u', null, new ViewText( viewDocument, ' x' ) )
						)
					)
				] );

				const domDiv = converter.viewToDom( viewDiv, document );

				expect( domDiv.innerHTML ).to.equal( 'x &nbsp;x &nbsp; x x&nbsp;<b> x&nbsp;</b><i><b><u> x</u></b></i>' );
			} );

			it( 'all together', () => {
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
					new ViewContainerElement( viewDocument, 'p', null, [
						new ViewText( viewDocument, ' x  x   x x ' ),
						new ViewAttributeElement( viewDocument, 'b', null, new ViewText( viewDocument, ' x ' ) ),
						new ViewAttributeElement( viewDocument, 'i', null,
							new ViewAttributeElement( viewDocument, 'b', null,
								new ViewAttributeElement( viewDocument, 'u', null, new ViewText( viewDocument, ' x ' ) )
							)
						)
					] ),
					new ViewContainerElement( viewDocument, 'p', null, new ViewText( viewDocument, '  x  ' ) )
				] );

				const domDiv = converter.viewToDom( viewDiv, document );

				expect( domDiv.innerHTML ).to.equal(
					'<p>&nbsp;x &nbsp;x &nbsp; x x&nbsp;<b> x&nbsp;</b><i><b><u> x&nbsp;</u></b></i></p><p>&nbsp; x &nbsp;</p>'
				);
			} );

			function test( inputTexts, output ) {
				if ( typeof inputTexts == 'string' ) {
					inputTexts = [ inputTexts ];
				}

				it( 'spaces in a text node: ' + inputTexts.join( '|' ) + ' -> ' + output, () => {
					const viewElement = new ViewContainerElement( viewDocument, 'p' );

					for ( const text of inputTexts ) {
						viewElement._appendChild( new ViewText( viewDocument, text.replace( /_/g, '\u00A0' ) ) );
					}

					const domElement = converter.viewToDom( viewElement, document );
					const data = showNbsp( domElement.innerHTML );

					expect( data ).to.equal( output );
				} );
			}

			function showNbsp( html ) {
				return html.replace( /&nbsp;/g, '_' );
			}

			// At the beginning.
			test( ' x', '_x' );
			test( '  x', '_ x' );
			test( '   x', '_ _x' );
			test( '    x', '_ _ x' );

			// At the end.
			test( 'x ', 'x_' );
			test( 'x  ', 'x _' );
			test( 'x   ', 'x __' );
			test( 'x    ', 'x _ _' );

			// In the middle.
			test( 'x x', 'x x' );
			test( 'x  x', 'x _x' );
			test( 'x   x', 'x _ x' );
			test( 'x    x', 'x _ _x' );

			// Complex.
			test( ' x ', '_x_' );
			test( '  x  x  ', '_ x _x _' );
			test( '   x x  ', '_ _x x _' );
			test( '   x x   ', '_ _x x __' );
			test( '   x    x ', '_ _x _ _x_' );

			// Only spaces.
			test( ' ', '_' );
			test( '  ', '__' );
			test( '   ', '_ _' );
			test( '    ', '_ __' );
			test( '     ', '_ _ _' );
			test( '      ', '_ _ __' );

			// With hard &nbsp;
			// It should be treated like a normal sign.
			test( '_x', '_x' );
			test( ' _x', '__x' );
			test( '  _x', '_ _x' );
			test( ' __x', '___x' );
			test( '___x', '___x' );
			test( '_ _x', '_ _x' );
			test( ' _ x', '__ x' );
			test( '  _x', '_ _x' );

			test( 'x_', 'x_' );
			test( 'x_ ', 'x__' );
			test( 'x_  ', 'x_ _' );
			test( 'x__ ', 'x___' );
			test( 'x___', 'x___' );
			test( 'x_ _', 'x_ _' );
			test( 'x _ ', 'x __' );
			test( 'x  _', 'x __' );

			test( 'x_x', 'x_x' );
			test( 'x___x', 'x___x' );
			test( 'x__ x', 'x__ x' );
			test( 'x_  x', 'x_ _x' );
			test( 'x  _x', 'x __x' );
			test( 'x __x', 'x __x' );
			test( 'x _ x', 'x _ x' );
			test( 'x  _  x', 'x __ _x' );

			test( [ 'x', 'y' ], 'xy' );
			test( [ 'x ', 'y' ], 'x y' );
			test( [ 'x  ', 'y' ], 'x _y' );
			test( [ 'x   ', 'y' ], 'x __y' );
			test( [ 'x    ', 'y' ], 'x _ _y' );

			test( [ 'x', ' y' ], 'x y' );
			test( [ 'x ', ' y' ], 'x_ y' );
			test( [ 'x  ', ' y' ], 'x _ y' );
			test( [ 'x   ', ' y' ], 'x __ y' );
			test( [ 'x    ', ' y' ], 'x _ _ y' );

			test( [ 'x', '_y' ], 'x_y' );
			test( [ 'x ', '_y' ], 'x _y' );
			test( [ 'x  ', '_y' ], 'x __y' );

			// Two text nodes.
			test( [ 'x   ', '_y' ], 'x ___y' );
			test( [ 'x    ', '_y' ], 'x _ __y' );

			test( [ 'x', '  y' ], 'x _y' );
			test( [ 'x ', '  y' ], 'x_ _y' );
			test( [ 'x  ', '  y' ], 'x _ _y' );
			test( [ 'x   ', '  y' ], 'x __ _y' );
			test( [ 'x    ', '  y' ], 'x _ _ _y' );

			test( [ 'x', '   y' ], 'x _ y' );
			test( [ 'x ', '   y' ], 'x_ _ y' );
			test( [ 'x  ', '   y' ], 'x _ _ y' );
			test( [ 'x   ', '   y' ], 'x __ _ y' );
			test( [ 'x    ', '   y' ], 'x _ _ _ y' );

			test( [ 'x',	' '		], 'x_' );
			test( [ 'x',	'  '	], 'x _' );
			test( [ 'x',	'   '	], 'x __' );
			test( [ 'x ',	' '		], 'x__' );
			test( [ 'x ',	'  '	], 'x_ _' );
			test( [ 'x ',	'   '	], 'x_ __' );
			test( [ 'x  ',	' '		], 'x __' );
			test( [ 'x  ',	'  '	], 'x _ _' );
			test( [ 'x  ',	'   '	], 'x _ __' );
			test( [ 'x   ',	' '		], 'x ___' );
			test( [ 'x   ',	'  '	], 'x __ _' );
			test( [ 'x   ',	'   '	], 'x __ __' );

			test( [ ' ',	'x'		], '_x' );
			test( [ '  ',	'x'		], '_ x' );
			test( [ '   ',	'x'		], '_ _x' );
			test( [ ' ',	' x'	], '_ x' );
			test( [ '  ',	' x'	], '__ x' );
			test( [ '   ',	' x'	], '_ _ x' );
			test( [ ' ',	'  x'	], '_ _x' );
			test( [ '  ',	'  x'	], '__ _x' );
			test( [ '   ',	'  x'	], '_ _ _x' );
			test( [ ' ',	'   x'	], '_ _ x' );
			test( [ '  ',	'   x'	], '__ _ x' );
			test( [ '   ',	'   x'	], '_ _ _ x' );

			// "Non-empty" + "empty" text nodes.
			test( [ 'x',	' ',		'x'		],	'x x' );
			test( [ 'x',	' ',		' x'	],	'x_ x' );
			test( [ 'x',	'  ',		' x'	],	'x _ x' );
			test( [ 'x',	'   ',		'  x'	],	'x __ _x' );
			test( [ 'x ',	' ',		' x'	],	'x__ x' );
			test( [ 'x ',	'  ',		' x'	],	'x_ _ x' );
			test( [ 'x ',	'   ',		'  x'	],	'x_ __ _x' );
			test( [ 'x  ',	' ',		' x'	],	'x __ x' );
			test( [ 'x  ',	'  ',		' x'	],	'x _ _ x' );
			test( [ 'x  ',	'   ',		'  x'	],	'x _ __ _x' );
			test( [ 'x   ',	' ',		' x'	],	'x ___ x' );
			test( [ 'x   ',	'  ',		' x'	],	'x __ _ x' );
			test( [ 'x   ',	'   ',		'  x'	],	'x __ __ _x' );

			// "Empty" + "empty" text nodes.
			test( [ ' ', ' ' ], '__' );
			test( [ '  ', ' ' ], '___' );
			test( [ '   ', ' ' ], '_ __' );
			test( [ ' ', '  ' ], '_ _' );
			test( [ ' ', '   ' ], '_ __' );
			test( [ '  ', '  ' ], '__ _' );
			test( [ '  ', '   ' ], '__ __' );
			test( [ '   ', '  ' ], '_ _ _' );
			test( [ '   ', '   ' ], '_ _ __' );

			it( 'not in preformatted blocks', () => {
				const viewPre = new ViewContainerElement( viewDocument, 'pre', null, [
					new ViewText( viewDocument, '   foo   ' ),
					new ViewText( viewDocument, ' bar ' )
				] );
				const domPre = converter.viewToDom( viewPre, document );

				expect( domPre.innerHTML ).to.equal( '   foo    bar ' );
			} );

			it( 'not in a preformatted block followed by a text', () => {
				const viewPre = new ViewAttributeElement( viewDocument, 'pre', null, new ViewText( viewDocument, 'foo   ' ) );
				const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [ viewPre, new ViewText( viewDocument, ' bar' ) ] );
				const domDiv = converter.viewToDom( viewDiv, document );

				expect( domDiv.innerHTML ).to.equal( '<pre>foo   </pre> bar' );
			} );

			describe( 'around <br>s', () => {
				it( 'before <br> – a single space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo_<br>bar' );
				} );

				it( 'before <br> – two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo  ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo _<br>bar' );
				} );

				it( 'before <br> – three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo   ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo __<br>bar' );
				} );

				it( 'before <br> – only a space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, ' ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '_<br>bar' );
				} );

				it( 'before <br> – only two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, '  ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '__<br>bar' );
				} );

				it( 'before <br> – only three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, '   ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '_ _<br>bar' );
				} );

				it( 'after <br> – a single space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_bar' );
				} );

				it( 'after <br> – two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '  bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_ bar' );
				} );

				it( 'after <br> – three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '   bar' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_ _bar' );
				} );

				it( 'after <br> – only a space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' ' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_' );
				} );

				it( 'after <br> – only two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '  ' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>__' );
				} );

				it( 'after <br> – only three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewText( viewDocument, 'foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '   ' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( 'foo<br>_ _' );
				} );

				it( 'between <br>s – a single space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>_<br>foo' );
				} );

				it( 'between <br>s – only two spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '  ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>__<br>foo' );
				} );

				it( 'between <br>s – only three spaces', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, '   ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>_ _<br>foo' );
				} );

				it( 'between <br>s – space and text', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, ' foo' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>_foo<br>foo' );
				} );

				it( 'between <br>s – text and space', () => {
					const viewDiv = new ViewContainerElement( viewDocument, 'div', null, [
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo ' ),
						new ViewEmptyElement( viewDocument, 'br' ),
						new ViewText( viewDocument, 'foo' )
					] );
					const domDiv = converter.viewToDom( viewDiv, document );

					expect( showNbsp( domDiv.innerHTML ) ).to.equal( '<br>foo_<br>foo' );
				} );
			} );
		} );
	} );

	describe( 'viewChildrenToDom()', () => {
		it( 'should convert children', () => {
			const viewP = parse( '<container:p>foo<attribute:b>bar</attribute:b></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP, document ) );

			expect( domChildren.length ).to.equal( 2 );
			expect( domChildren[ 0 ].data ).to.equal( 'foo' );
			expect( domChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domChildren[ 1 ].childNodes.length ).to.equal( 1 );
		} );

		it( 'should add filler', () => {
			const viewP = parse( '<container:p></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP, document ) );

			expect( domChildren.length ).to.equal( 1 );
			expect( converter.isBlockFiller( domChildren[ 0 ] ) ).to.be.true;
		} );

		it( 'should add filler according to fillerPositionOffset', () => {
			const viewP = parse( '<container:p>foo</container:p>' );
			viewP.getFillerOffset = () => 0;

			const domChildren = Array.from( converter.viewChildrenToDom( viewP, document ) );

			expect( domChildren.length ).to.equal( 2 );
			expect( converter.isBlockFiller( domChildren[ 0 ] ) ).to.be.true;
			expect( domChildren[ 1 ].data ).to.equal( 'foo' );
		} );

		it( 'should pass options', () => {
			const viewP = parse( '<container:p>foo<attribute:b>bar</attribute:b></container:p>' );

			const domChildren = Array.from( converter.viewChildrenToDom( viewP, document, { withChildren: false } ) );

			expect( domChildren.length ).to.equal( 2 );
			expect( domChildren[ 0 ].data ).to.equal( 'foo' );
			expect( domChildren[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domChildren[ 1 ].childNodes.length ).to.equal( 0 );
		} );
	} );

	describe( 'viewPositionToDom()', () => {
		it( 'should convert the position in the text', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domFoo );
			const { view: viewP, selection } = parse( '<container:p>fo{}o</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 2 );
			expect( domPosition.parent ).to.equal( domFoo );
		} );

		it( 'should support unicode', () => {
			const domText = document.createTextNode( 'நிலைக்கு' );
			const domP = createElement( document, 'p', null, domText );
			const { view: viewP, selection } = parse( '<container:p>நிலை{}க்கு</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 4 );
			expect( domPosition.parent ).to.equal( domText );
		} );

		it( 'should convert the position in the empty element', () => {
			const domP = createElement( document, 'p' );
			const { view: viewP, selection } = parse( '<container:p>[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 0 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should convert the position in the non-empty element', () => {
			const domB = createElement( document, 'b', null, 'foo' );
			const domP = createElement( document, 'p', null, domB );
			const { view: viewP, selection } = parse( '<container:p><attribute:b>foo</attribute:b>[]</container:p>' );

			converter.bindElements( domP, viewP );
			converter.bindElements( domB, viewP.getChild( 0 ) );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 1 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should convert the position after text', () => {
			const domP = createElement( document, 'p', null, 'foo' );
			const { view: viewP, selection } = parse( '<container:p>foo[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 1 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should convert the position before text', () => {
			const domP = createElement( document, 'p', null, 'foo' );
			const { view: viewP, selection } = parse( '<container:p>[]foo</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( 0 );
			expect( domPosition.parent ).to.equal( domP );
		} );

		it( 'should update offset if DOM text node starts with inline filler', () => {
			const domFoo = document.createTextNode( INLINE_FILLER + 'foo' );
			const domP = createElement( document, 'p', null, domFoo );
			const { view: viewP, selection } = parse( '<container:p>fo{}o</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( INLINE_FILLER_LENGTH + 2 );
			expect( domPosition.parent ).to.equal( domFoo );
		} );

		it( 'should move the position to the text node if the position is where inline filler is', () => {
			const domFiller = document.createTextNode( INLINE_FILLER );
			const domP = createElement( document, 'p', null, domFiller );
			const { view: viewP, selection } = parse( '<container:p>[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition.offset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domPosition.parent ).to.equal( domFiller );
		} );

		it( 'should return null if view position is after a view element that has not been rendered to DOM', () => {
			const domP = createElement( document, 'p', null );
			const { view: viewP, selection } = parse( '<container:p><attribute:b>foo</attribute:b>[]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewPosition = selection.getFirstPosition();
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition ).to.equal( null );
		} );

		it( 'should return null if view position is in a view text node that has not been rendered to DOM', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			const viewPosition = new ViewPosition( viewText, 1 );
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition ).to.equal( null );
		} );

		it( 'should return null if view position is in a view element that has not been rendered to DOM', () => {
			const viewElement = new ViewContainerElement( viewDocument, 'div' );
			const viewPosition = new ViewPosition( viewElement, 0 );
			const domPosition = converter.viewPositionToDom( viewPosition );

			expect( domPosition ).to.equal( null );
		} );
	} );

	describe( 'viewRangeToDom()', () => {
		it( 'should convert view range to DOM range', () => {
			const domFoo = document.createTextNode( 'foo' );
			const domP = createElement( document, 'p', null, domFoo );
			const { view: viewP, selection } = parse( '<container:p>fo{o]</container:p>' );

			converter.bindElements( domP, viewP );

			const viewRange = selection.getFirstRange();
			const domRange = converter.viewRangeToDom( viewRange );

			expect( domRange ).to.be.instanceof( Range );
			expect( domRange.startContainer ).to.equal( domFoo );
			expect( domRange.startOffset ).to.equal( 2 );
			expect( domRange.endContainer ).to.equal( domP );
			expect( domRange.endOffset ).to.equal( 1 );
		} );
	} );
} );
