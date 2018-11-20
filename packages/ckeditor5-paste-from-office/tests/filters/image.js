/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { parseHtml } from '../../src/filters/parse';
import { replaceImagesSourceWithBase64 } from '../../src/filters/image';
import { browserFixtures } from '../_data/image/index';

describe( 'Filters', () => {
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

				afterEach( () => {
					editor.destroy();
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
	} );
} );
