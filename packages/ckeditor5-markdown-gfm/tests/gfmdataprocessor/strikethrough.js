/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'MarkdownGfmDataProcessor', () => {
	describe( 'Strikethrough', () => {
		it( 'should process strikethrough text', () => {
			testDataProcessor(
				'~deleted~',

				'<p><del>deleted</del></p>',

				// Single tildes work on github.com, but are technically prohibited by the GFM spec, so they are turned to double tildes.
				'~~deleted~~'
			);
		} );

		it( 'should process strikethrough inside text', () => {
			testDataProcessor(
				'This is ~deleted content~.',

				'<p>This is <del>deleted content</del>.</p>',

				// Single tildes work on github.com, but are technically prohibited by the GFM spec, so they are turned to double tildes.
				'This is ~~deleted content~~.'
			);
		} );
	} );
} );
