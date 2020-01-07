/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor as test } from '../../tests/_utils/utils';

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
