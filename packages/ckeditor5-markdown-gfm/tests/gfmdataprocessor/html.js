/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor } from '../_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'html', () => {
		it( 'should keep html', () => {
			testDataProcessor(
				'test with <keep>html</keep> and <notkeep>not html</notkeep>',

				'<p>test with <keep>html</keep> and <notkeep>not html</notkeep></p>',

				'test with <keep>html</keep> and not html',

				{
					setup: dataProcessor => {
						dataProcessor.keepHtml( 'keep' );
					}
				}
			);
		} );
	} );
} );
