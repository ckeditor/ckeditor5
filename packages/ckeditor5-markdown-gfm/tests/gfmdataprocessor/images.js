/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'images', () => {
		it( 'should process images', () => {
			testDataProcessor(
				'![alt text](http://example.com/image.png "title text")',

				// GitHub is rendering as:
				// <p><a href="..." target="_blank"><img src="..." alt="..." title="..." data-canonical-src="..."></a></p>
				// We will handle images separately by features.
				'<p><img alt="alt text" src="http://example.com/image.png" title="title text"></img></p>'

			);
		} );

		it( 'should process images without title', () => {
			testDataProcessor(
				'![alt text](http://example.com/image.png)',
				'<p><img alt="alt text" src="http://example.com/image.png"></img></p>'
			);
		} );

		it( 'should process images without alt text', () => {
			testDataProcessor(
				'![](http://example.com/image.png "title text")',
				'<p><img alt="" src="http://example.com/image.png" title="title text"></img></p>'
			);
		} );

		it( 'should process referenced images', () => {
			testDataProcessor(
				'![alt text][logo]\n\n' +
				'[logo]: http://example.com/image.png "title text"',

				'<p><img alt="alt text" src="http://example.com/image.png" title="title text"></img></p>',

				// Referenced images when converting back are converted to direct links.
				'![alt text](http://example.com/image.png "title text")'
			);
		} );

		it( 'should process referenced images without title', () => {
			testDataProcessor(
				'![alt text][logo]\n\n' +
				'[logo]: http://example.com/image.png',

				'<p><img alt="alt text" src="http://example.com/image.png"></img></p>',

				// Referenced images when converting back are converted to direct links.
				'![alt text](http://example.com/image.png)'
			);
		} );

		it( 'should process referenced images without alt text', () => {
			testDataProcessor(
				'![][logo]\n\n' +
				'[logo]: http://example.com/image.png "title text"',

				'<p><img alt="" src="http://example.com/image.png" title="title text"></img></p>',

				// Referenced images when converting back are converted to direct links.
				'![](http://example.com/image.png "title text")'
			);
		} );
	} );
} );
