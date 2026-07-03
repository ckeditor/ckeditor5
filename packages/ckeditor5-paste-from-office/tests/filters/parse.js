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

			it( 'should remove a `<style>` block located in the body', () => {
				const html = '<body><style>p { color: red; }</style><p>Foo Bar</p></body>';
				const { body, bodyString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( body.childCount ).toBe( 1 );
				expect( bodyString ).toBe( '<p>Foo Bar</p>' );
			} );

			it( 'should remove a `<style>` block nested in the body (e.g. Excel Online)', () => {
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

				const { body, bodyString } = parsePasteOfficeHtml( html );

				expect( body ).toBeInstanceOf( ViewDocumentFragment );
				expect( bodyString ).not.toContain( '<style>' );
				expect( bodyString ).not.toContain( 'font-size:48.0pt' );
				expect( bodyString ).toContain( 'Hello' );
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
