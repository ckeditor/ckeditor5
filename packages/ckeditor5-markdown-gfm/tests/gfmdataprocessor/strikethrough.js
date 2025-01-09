/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'Strikethrough', () => {
		it( 'should process strikethrough text', () => {
			testDataProcessor(
				'~deleted~',

				'<p><del>deleted</del></p>'
			);
		} );

		it( 'should process strikethrough inside text', () => {
			testDataProcessor(
				'This is ~deleted content~.',

				'<p>This is <del>deleted content</del>.</p>'
			);
		} );
	} );
} );
