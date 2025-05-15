/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { parseHtml } from '../../src/filters/parse.js';
import { replaceImagesSourceWithBase64, _convertHexToBase64 } from '../../src/filters/image.js';
import { browserFixtures } from '../_data/image/index.js';

describe( 'PasteFromOffice - filters', () => {
	describe( 'image', () => {
		let editor;

		describe( 'replaceImagesSourceWithBase64()', () => {
			describe( 'with RTF', () => {
				beforeEach( () => {
					return VirtualTestEditor
						.create( {} )
						.then( editorInstance => {
							editor = editorInstance;
						} );
				} );

				afterEach( async () => {
					await editor.destroy();
				} );

				it( 'should handle correctly empty RTF data', () => {
					const input = '<p>Foo <img src="file://test.jpg" /></p>';
					const rtfString = '';
					const { body } = parseHtml( input );

					replaceImagesSourceWithBase64( body, rtfString, editor.editing.model );

					expect( stringifyView( body ) ).to.equal( normalizeHtml( input ) );
				} );

				it( 'should not change image with "http://" source', () => {
					const input = '<p>Foo <img src="http://ckeditor.com/logo.jpg" /></p>';
					const rtfString = browserFixtures.chrome.inputRtf.onlineOffline;
					const { body } = parseHtml( input );

					replaceImagesSourceWithBase64( body, rtfString, editor.editing.model );

					expect( stringifyView( body ) ).to.equal( normalizeHtml( input ) );
				} );

				it( 'should not change image with "file://" source if not images in RTF data', () => {
					const input = '<p>Foo <img src="file://test.jpg" /></p>';
					const rtfString = '{\\rtf1\\adeflang1025\\ansi\\ansicpg1252\\uc1\\adeff31507}';
					const { body } = parseHtml( input );

					replaceImagesSourceWithBase64( body, rtfString, editor.editing.model );

					expect( stringifyView( body ) ).to.equal( normalizeHtml( input ) );
				} );
			} );
		} );

		describe( '_convertHexToBase64()', () => {
			it( '#1', () => {
				const hex = '48656c6c6f20576f726c6421';
				const base64 = 'SGVsbG8gV29ybGQh';

				expect( _convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#2', () => {
				const hex = '466f6f204261722042617a';
				const base64 = 'Rm9vIEJhciBCYXo=';

				expect( _convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#3', () => {
				const hex = '687474703a2f2f636b656469746f722e636f6d';
				const base64 = 'aHR0cDovL2NrZWRpdG9yLmNvbQ==';

				expect( _convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#4', () => {
				const hex = '434B456469746F72203520697320746865206265737421';
				const base64 = 'Q0tFZGl0b3IgNSBpcyB0aGUgYmVzdCE=';

				expect( _convertHexToBase64( hex ) ).to.equal( base64 );
			} );

			it( '#5', () => {
				const hex = '496E74726F6475636564204D6564696120656D6265642C20626C6F636B20636F6E74656E7420696E207461626' +
					'C657320616E6420696E746567726174696F6E73207769746820416E67756C617220322B20616E642052656163742E2046' +
					'696E64206F7574206D6F726520696E2074686520434B456469746F722035207631312E312E302072656C6561736564206' +
					'26C6F6720706F73742E';

				const base64 = 'SW50cm9kdWNlZCBNZWRpYSBlbWJlZCwgYmxvY2sgY29udGVudCBpbiB0YWJsZXMgYW5kIGludGVncmF0aW9ucy' +
					'B3aXRoIEFuZ3VsYXIgMisgYW5kIFJlYWN0LiBGaW5kIG91dCBtb3JlIGluIHRoZSBDS0VkaXRvciA1IHYxMS4xLjAgcmVsZWF' +
					'zZWQgYmxvZyBwb3N0Lg==';

				expect( _convertHexToBase64( hex ) ).to.equal( base64 );
			} );
		} );
	} );
} );
