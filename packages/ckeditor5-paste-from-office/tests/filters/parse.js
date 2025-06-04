/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment.js';

import { parseHtml } from '../../src/filters/parse.js';

describe( 'PasteFromOffice - filters', () => {
	describe( 'parse', () => {
		describe( 'parseHtml()', () => {
			it( 'correctly parses HTML with body and one style tag', () => {
				const html = '<head><style>p { color: red; } a { font-size: 12px; }</style></head><body><p>Foo Bar</p></body>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1, 'body.childCount' );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 1, 'styles.length' );
				expect( styles[ 0 ] ).to.instanceof( CSSStyleSheet );
				expect( styles[ 0 ].cssRules.length ).to.equal( 2 );
				expect( styles[ 0 ].cssRules[ 0 ].style.color ).to.equal( 'red' );
				expect( styles[ 0 ].cssRules[ 1 ].style[ 'font-size' ] ).to.equal( '12px' );

				expect( stylesString ).to.equal( 'p { color: red; } a { font-size: 12px; }' );
			} );

			it( 'correctly parses HTML with body contents only', () => {
				const html = '<p>Foo Bar</p>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1 );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'correctly parses HTML with no body and multiple style tags', () => {
				const html = '<html><head><style>p { color: blue; }</style><style>a { color: green; }</style></head></html>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 0 );

				expect( bodyString ).to.equal( '' );

				expect( styles.length ).to.equal( 2 );
				expect( styles[ 0 ] ).to.instanceof( CSSStyleSheet );
				expect( styles[ 1 ] ).to.instanceof( CSSStyleSheet );
				expect( styles[ 0 ].cssRules.length ).to.equal( 1 );
				expect( styles[ 1 ].cssRules.length ).to.equal( 1 );
				expect( styles[ 0 ].cssRules[ 0 ].style.color ).to.equal( 'blue' );
				expect( styles[ 1 ].cssRules[ 0 ].style.color ).to.equal( 'green' );

				expect( stylesString ).to.equal( 'p { color: blue; } a { color: green; }' );
			} );

			it( 'correctly parses HTML with no body and no style tags', () => {
				const html = '<html><head><meta name="Foo" content="Bar"></head></html>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 0 );

				expect( bodyString ).to.equal( '' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'correctly parses HTML with body contents and empty style tag', () => {
				const html = '<head><style></style></head><body><p>Foo Bar</p></body>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1 );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'should remove any content after body closing tag - plain', () => {
				const html = '<html><head></head><body><p>Foo Bar</p></body>Ba</html>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1, 'body.childCount' );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'should remove any content after body closing tag - inline', () => {
				const html = '<html><head></head><body><p>Foo Bar</p></body><span>Fo</span></html>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1, 'body.childCount' );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'should remove any content after body closing tag - block', () => {
				const html = '<html><head></head><body><p>Foo Bar</p></body><p>ar</p></html>';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1, 'body.childCount' );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'should remove any content after body closing tag - no html tag', () => {
				const html = '<head></head><body><p>Foo Bar</p></body>oo';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 1, 'body.childCount' );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'should not remove any content if no body tag', () => {
				const html = '<p>Foo Bar</p>Baz';
				const { body, bodyString, styles, stylesString } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );
				expect( body.childCount ).to.equal( 2, 'body.childCount' );

				expect( bodyString ).to.equal( '<p>Foo Bar</p>Baz' );

				expect( styles.length ).to.equal( 0 );

				expect( stylesString ).to.equal( '' );
			} );

			it( 'should remove all comments', () => {
				const html = '<body><!--c1--><p>Foo Bar</p><!--c2--></body>';
				const { body } = parseHtml( html );

				expect( body ).to.instanceof( DocumentFragment );

				expect( body.childCount ).to.equal( 1 );

				expect( body.getChild( 0 ).name ).to.equal( 'p' );
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
					const { body, bodyString } = parseHtml( html );

					expect( body ).to.instanceof( DocumentFragment );
					expect( body.childCount ).to.equal( 1 );
					expect( bodyString ).to.equal( '<p>foo</p>' );
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
					const { body, bodyString } = parseHtml( html );

					expect( body ).to.instanceof( DocumentFragment );
					expect( body.childCount ).to.equal( 1 );
					expect( bodyString ).to.equal( '<p>foo</p>' );
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
					const { body, bodyString } = parseHtml( html );

					expect( body ).to.instanceof( DocumentFragment );
					expect( body.childCount ).to.equal( 1 );
					expect( bodyString ).to.equal( '<p>foo</p>' );
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
					const { body, bodyString } = parseHtml( html );

					expect( body ).to.instanceof( DocumentFragment );
					expect( body.childCount ).to.equal( 1 );
					expect( bodyString ).to.equal( '<p>foo</p>' );
				} );
			} );
		} );
	} );
} );
