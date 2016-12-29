/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { testDataProcessor as test } from 'ckeditor5-markdown-gfm/tests/_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'Strikethrough', () => {
		it( 'should process strikethrough text', () => {
			test(
				'~~deleted~~',

				'<p><del>deleted</del></p>'
			);
		} );

		it( 'should process strikethrough inside text', () => {
			test(
				'This is ~~deleted content~~.',

				'<p>This is <del>deleted content</del>.</p>'
			);
		} );
	} );
} );
