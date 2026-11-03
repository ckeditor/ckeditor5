/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { ViewDocumentFragment } from '@ckeditor/ckeditor5-engine';

import { parsePasteOfficeHtml } from '../../src/filters/parse.js';

describe( 'PasteFromOffice - filters', () => {
	describe( 'parse', () => {
		describe( 'parsePasteOfficeHtml()', () => {
			it( 'correctly parses HTML with body and one style tag', () => {
				const html = '<head><style>p { color: red; } a { font-size: 12px; }</style></head><body><p>Foo Bar</p></body>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount, 'body.childCount' ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length, 'styles.length' ).toBe( 1 );
				expect( styles[ 0 ] ).toBeInstanceOf( CSSStyleSheet );
				expect( styles[ 0 ].cssRules.length ).toBe( 2 );
				expect( styles[ 0 ].cssRules[ 0 ].style.color ).toBe( 'red' );
				expect( styles[ 0 ].cssRules[ 1 ].style[ 'font-size' ] ).toBe( '12px' );

				expect( stylesString ).toBe( 'p { color: red; } a { font-size: 12px; }' );
			} );

			it( 'correctly parses HTML with body contents only', () => {
				const html = '<p>Foo Bar</p>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'correctly parses HTML with no body and multiple style tags', () => {
				const html = '<html><head><style>p { color: blue; }</style><style>a { color: green; }</style></head></html>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount ).toBe( 0 );

				expect( bodyString ).toBe( '' );

				expect( styles.length ).toBe( 2 );
				expect( styles[ 0 ] ).toBeInstanceOf( CSSStyleSheet );
				expect( styles[ 1 ] ).toBeInstanceOf( CSSStyleSheet );
				expect( styles[ 0 ].cssRules.length ).toBe( 1 );
				expect( styles[ 1 ].cssRules.length ).toBe( 1 );
				expect( styles[ 0 ].cssRules[ 0 ].style.color ).toBe( 'blue' );
				expect( styles[ 1 ].cssRules[ 0 ].style.color ).toBe( 'green' );

				expect( stylesString ).toBe( 'p { color: blue; } a { color: green; }' );
			} );

			it( 'correctly parses HTML with no body and no style tags', () => {
				const html = '<html><head><meta name="Foo" content="Bar"></head></html>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount ).toBe( 0 );

				expect( bodyString ).toBe( '' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'correctly parses HTML with body contents and empty style tag', () => {
				const html = '<head><style></style></head><body><p>Foo Bar</p></body>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'should move a `<style>` block located in the body out of the body and extract its rules', () => {
				const html = '<body><style>p { color: red; }</style><p>Foo Bar</p></body>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount ).toBe( 1 );
				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 1 );
				expect( styles[ 0 ] ).toBeInstanceOf( CSSStyleSheet );
				expect( styles[ 0 ].cssRules.length ).toBe( 1 );
				expect( styles[ 0 ].cssRules[ 0 ].style.color ).toBe( 'red' );
				expect( stylesString ).toBe( 'p { color: red; }' );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/20188.
			it( 'should move a `<style>` block nested in the body out of the body and extract its rules (e.g. Excel Online)', () => {
				// Excel Online wraps a full document inside a `<div>`, which flattens the `<style>` into the body.
				const html =
					'<div ccp_infra_version=\'3\' data-ccp-timestamp=\'1780896911866\'>' +
						'<html><head>' +
							'<meta name=Generator content="Microsoft Excel 15">' +
							'<style>td { color:black; } .xl63 { font-size:48.0pt; }</style>' +
						'</head><body>' +
							'<table><tr><td class="xl63">Hello</td></tr></table>' +
						'</body></html>' +
					'</div>';

				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( bodyString ).not.toContain( '<style>' );
				expect( bodyString ).not.toContain( 'font-size:48.0pt' );
				expect( bodyString ).toContain( 'Hello' );

				expect( styles.length ).toBe( 1 );
				expect( styles[ 0 ].cssRules.length ).toBe( 2 );
				expect( styles[ 0 ].cssRules[ 1 ].selectorText ).toBe( '.xl63' );
				expect( stylesString ).toBe( 'td { color:black; } .xl63 { font-size:48.0pt; }' );
			} );

			it( 'should extract rules of a `<style>` block placed in the body by desktop Excel', () => {
				// Recent desktop Excel builds use the Excel Online clipboard format: the `<meta>` tags and the `<style>`
				// block defining the `.xl*` cell classes sit inside `<body>`, wrapped in a `ccp_infra` div.
				const html =
					'<meta charset=\'utf-8\'><html><head></head><body>' +
						'<div ccp_infra_version=\'3\' ccp_infra_timestamp=\'1780896911866\'>' +
							'<meta name="ProgId" content="Excel.Sheet">' +
							'<meta name="Generator" content="Microsoft Excel 15">' +
							'<style>' +
								'td { border:none; } ' +
								'.xl107 { color:white; font-weight:700; border-top:.5pt solid #D0D0D0; background:#5C00D7; }' +
							'</style>' +
							'<table><tr><td class="xl107">Productivity Pack Features</td></tr></table>' +
						'</div>' +
					'</body></html>';

				const { bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( bodyString ).not.toContain( '<style>' );
				expect( bodyString ).not.toContain( '#5C00D7' );
				expect( bodyString ).toContain( 'Productivity Pack Features' );

				expect( styles.length ).toBe( 1 );
				expect( styles[ 0 ].cssRules.length ).toBe( 2 );

				const xl107 = styles[ 0 ].cssRules[ 1 ];

				expect( xl107.selectorText ).toBe( '.xl107' );
				expect( xl107.style.color ).toBe( 'white' );
				expect( xl107.style[ 'font-weight' ] ).toBe( '700' );
				expect( stylesString ).toContain( '.xl107' );
			} );

			it( 'should keep `<style>` blocks from the head before the ones moved from the body', () => {
				const html =
					'<html><head><style>p { color: red; }</style></head>' +
					'<body><style>p { color: blue; }</style><p>Foo</p><style>a { color: green; }</style></body></html>';

				const { bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( bodyString ).toBe( '<p>Foo</p>' );

				expect( styles.length ).toBe( 3 );
				expect( styles[ 0 ].cssRules[ 0 ].style.color ).toBe( 'red' );
				expect( styles[ 1 ].cssRules[ 0 ].style.color ).toBe( 'blue' );
				expect( styles[ 2 ].cssRules[ 0 ].style.color ).toBe( 'green' );
				expect( stylesString ).toBe( 'p { color: red; } p { color: blue; } a { color: green; }' );
			} );

			it( 'should not remove `<style>` blocks located in the head', () => {
				const html = '<head><style>p { color: red; }</style></head><body><p>Foo Bar</p></body>';
				const { bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );
				expect( styles.length ).toBe( 1 );
				expect( stylesString ).toBe( 'p { color: red; }' );
			} );

			it( 'should remove any content after body closing tag - plain', () => {
				const html = '<html><head></head><body><p>Foo Bar</p></body>Ba</html>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount, 'body.childCount' ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'should remove any content after body closing tag - inline', () => {
				const html = '<html><head></head><body><p>Foo Bar</p></body><span>Fo</span></html>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount, 'body.childCount' ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'should remove any content after body closing tag - block', () => {
				const html = '<html><head></head><body><p>Foo Bar</p></body><p>ar</p></html>';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount, 'body.childCount' ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'should remove any content after body closing tag - no html tag', () => {
				const html = '<head></head><body><p>Foo Bar</p></body>oo';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount, 'body.childCount' ).toBe( 1 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'should not remove any content if no body tag', () => {
				const html = '<p>Foo Bar</p>Baz';
				const { body, bodyString, styles, stylesString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount, 'body.childCount' ).toBe( 2 );

				expect( bodyString ).toBe( '<p>Foo Bar</p>Baz' );

				expect( styles.length ).toBe( 0 );

				expect( stylesString ).toBe( '' );
			} );

			it( 'should remove all comments', () => {
				const html = '<body><!--c1--><p>Foo Bar</p><!--c2--></body>';
				const { body } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );

				expect( body.childCount ).toBe( 1 );

				expect( body.getChild( 0 ).name ).toBe( 'p' );
			} );

			it( 'should remove all processing instructions', () => {
				const html = '<body><?instruction 1?><p>Foo Bar</p><?instruction 2?></body>';
				const { body } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );

				expect( body.childCount ).toBe( 1 );

				expect( body.getChild( 0 ).name ).toBe( 'p' );
			} );

			it( 'should remove processing instructions nested in elements', () => {
				const html = '<body><p>Foo<?instruction 1?>Bar</p></body>';
				const { body } = parsePasteOfficeHtml( html );

				const paragraph = body.getChild( 0 );

				expect( paragraph.name ).toBe( 'p' );
				expect( Array.from( paragraph.getChildren() ).every( child => child.is( '$text' ) ) ).toBe( true );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/15333.
			describe( 'should remove MS Windows specific tags to prevent incorrect parsing of HTML', () => {
				it( 'should remove <o:SmartTagType> empty tag (with or without `/` at the end)', () => {
					const html =
						'<html>' +
							'<head>' +
								'<o:SmartTagType/>' +
								'<o:SmartTagType>' +
							'</head>' +
							'<body>' +
								'<p>foo</p>' +
							'</body>' +
						'</html>';
					const { body, bodyString } = parsePasteOfficeHtml( html );

					expect( body ).toBeInstanceOf( ViewDocumentFragment );
					expect( body.childCount ).toBe( 1 );
					expect( bodyString ).toBe( '<p>foo</p>' );
				} );

				it( 'should remove <o:SmartTagType> empty tag with white space before the ending', () => {
					const html =
						'<html>' +
							'<head>' +
								'<o:SmartTagType />' +
								'<o:SmartTagType >' +
							'</head>' +
							'<body>' +
								'<p>foo</p>' +
							'</body>' +
						'</html>';
					const { body, bodyString } = parsePasteOfficeHtml( html );

					expect( body ).toBeInstanceOf( ViewDocumentFragment );
					expect( body.childCount ).toBe( 1 );
					expect( bodyString ).toBe( '<p>foo</p>' );
				} );

				it( 'should remove <o:SmartTagType> tag with attributes (with and without values)', () => {
					const html =
						'<html>' +
							'<head>' +
								'<o:SmartTagType namespaceuri="foo:bar:smarttags" baz />' +
							'</head>' +
							'<body>' +
								'<p>foo</p>' +
							'</body>' +
						'</html>';
					const { body, bodyString } = parsePasteOfficeHtml( html );

					expect( body ).toBeInstanceOf( ViewDocumentFragment );
					expect( body.childCount ).toBe( 1 );
					expect( bodyString ).toBe( '<p>foo</p>' );
				} );

				it( 'should remove <o:SmartTagType> tag with attributes containing `>`', () => {
					const html =
						'<html>' +
							'<head>' +
								'<o:SmartTagType namespaceuri="foo>bar>smarttags" />' +
							'</head>' +
							'<body>' +
								'<p>foo</p>' +
							'</body>' +
						'</html>';
					const { body, bodyString } = parsePasteOfficeHtml( html );

					expect( body ).toBeInstanceOf( ViewDocumentFragment );
					expect( body.childCount ).toBe( 1 );
					expect( bodyString ).toBe( '<p>foo</p>' );
				} );
			} );
		} );
	} );
} );
