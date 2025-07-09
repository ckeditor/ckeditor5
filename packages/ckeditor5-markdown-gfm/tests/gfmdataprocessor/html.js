/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'MarkdownGfmDataProcessor', () => {
	describe( 'HTML', () => {
		it( 'should keep HTML', () => {
			testDataProcessor(
				'test with <keep>html</keep> and <notkeep>not html</notkeep><!-- HTML comment -->',
				'<p>test with <keep>html</keep> and <notkeep>not html</notkeep></p>',
				'test with <keep>html</keep> and not html',
				{
					setup: dataProcessor => {
						dataProcessor.keepHtml( 'keep' );
					}
				}
			);
		} );

		it( 'should handle Markdown inside HTML', () => {
			testDataProcessor(
				'test with <keep>**BOLD**</keep>',
				'<p>test with <keep><strong>BOLD</strong></keep></p>',
				'test with <keep>**BOLD**</keep>',
				{
					setup: dataProcessor => {
						dataProcessor.keepHtml( 'keep' );
					}
				}
			);
		} );

		it( 'should keep nested HTML', () => {
			testDataProcessor(
				'test with <keep><nested>HTML</nested> and <notkeep>not html</notkeep></keep>',
				'<p>test with <keep><nested>HTML</nested> and <notkeep>not html</notkeep></keep></p>',
				'test with <keep><nested>HTML</nested> and not html</keep>',
				{
					setup: dataProcessor => {
						dataProcessor.keepHtml( 'keep' );
						dataProcessor.keepHtml( 'nested' );
					}
				}
			);
		} );

		it( 'should keep HTML in root', () => {
			testDataProcessor(
				'<keep>Test1</keep>',
				'<p><keep>Test1</keep></p>',
				'<keep>Test1</keep>',
				{
					setup: dataProcessor => {
						dataProcessor.keepHtml( 'keep' );
					}
				}
			);
		} );

		it( 'maintains HTML attributes', () => {
			testDataProcessor(
				'<keep data-key="value">Test1</keep>',
				'<p><keep data-key="value">Test1</keep></p>',
				'<keep data-key="value">Test1</keep>',
				{
					setup: dataProcessor => {
						dataProcessor.keepHtml( 'keep' );
					}
				}
			);
		} );
	} );
} );
