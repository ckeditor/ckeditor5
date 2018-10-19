/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals CSSStyleSheet */

import DocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';

import { parseHtml, convertHexToBase64 } from '../../src/filters/utils';

describe( 'Filters', () => {
	describe( 'Utils', () => {
		describe( 'parseHtml', () => {
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
		} );

		describe( 'convertHexToBase64', () => {
			it( '#1', () => {
				const hex = '48656c6c6f20576f726c6421';
				const base64 = 'SGVsbG8gV29ybGQh';

				expect( convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#2', () => {
				const hex = '466f6f204261722042617a';
				const base64 = 'Rm9vIEJhciBCYXo=';

				expect( convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#3', () => {
				const hex = '687474703a2f2f636b656469746f722e636f6d';
				const base64 = 'aHR0cDovL2NrZWRpdG9yLmNvbQ==';

				expect( convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#4', () => {
				const hex = '434B456469746F72203520697320746865206265737421';
				const base64 = 'Q0tFZGl0b3IgNSBpcyB0aGUgYmVzdCE=';

				expect( convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#5', () => {
				const hex = '496E74726F6475636564204D6564696120656D6265642C20626C6F636B20636F6E74656E7420696E207461626' +
					'C657320616E6420696E746567726174696F6E73207769746820416E67756C617220322B20616E642052656163742E2046' +
					'696E64206F7574206D6F726520696E2074686520434B456469746F722035207631312E312E302072656C6561736564206' +
					'26C6F6720706F73742E';

				const base64 = 'SW50cm9kdWNlZCBNZWRpYSBlbWJlZCwgYmxvY2sgY29udGVudCBpbiB0YWJsZXMgYW5kIGludGVncmF0aW9ucy' +
					'B3aXRoIEFuZ3VsYXIgMisgYW5kIFJlYWN0LiBGaW5kIG91dCBtb3JlIGluIHRoZSBDS0VkaXRvciA1IHYxMS4xLjAgcmVsZWF' +
					'zZWQgYmxvZyBwb3N0Lg==';

				expect( convertHexToBase64( hex ) ).to.equal( base64 );
			} );
		} );
	} );
} );
