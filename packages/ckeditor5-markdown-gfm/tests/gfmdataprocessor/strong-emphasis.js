/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor } from '../_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'strong and emphasis', () => {
		it( 'should process strong', () => {
			testDataProcessor(
				'**this is strong** and __this too__',

				'<p><strong>this is strong</strong> and <strong>this too</strong></p>',

				// When converting back strong will always be represented by **.
				'**this is strong** and **this too**'
			);
		} );

		it( 'should process emphasis', () => {
			testDataProcessor(
				'*this is emphasis* and _this too_',

				'<p><em>this is emphasis</em> and <em>this too</em></p>',

				// When converting back emphasis will always be represented by __.
				'_this is emphasis_ and _this too_'
			);
		} );

		it( 'should process strong and emphasis together #1', () => {
			testDataProcessor(
				'***This is strong and em.***',

				'<p><strong><em>This is strong and em.</em></strong></p>',

				// Normalized after converting back.
				'**_This is strong and em._**'
			);
		} );

		it( 'should process strong and emphasis together #2', () => {
			testDataProcessor(
				'Single ***word*** is strong and em.',

				'<p>Single <strong><em>word</em></strong> is strong and em.</p>',

				// Normalized after converting back.
				'Single **_word_** is strong and em.'
			);
		} );

		it( 'should process strong and emphasis together #3', () => {
			testDataProcessor(
				'___This is strong and em.___',

				'<p><strong><em>This is strong and em.</em></strong></p>',

				// Normalized after converting back.
				'**_This is strong and em._**'

			);
		} );

		it( 'should process strong and emphasis together #4', () => {
			testDataProcessor(
				'Single ___word___ is strong and em.',

				'<p>Single <strong><em>word</em></strong> is strong and em.</p>',

				// Normalized after converting back.
				'Single **_word_** is strong and em.'
			);
		} );

		it( 'should not process emphasis inside words', () => {
			testDataProcessor(
				'This should_not_be_emp.',

				'<p>This should_not_be_emp.</p>',

				// Turndow escape markdown markup characters used inside text.
				'This should\\_not\\_be\\_emp.'
			);
		} );

		it( 'should not render escape marks', () => {
			testDataProcessor(
				// Following the previous test.
				'This should\\_not\\_be\\_emp.',

				'<p>This should_not_be_emp.</p>'
			);
		} );

		// Below two tests are not working because marked library renders nested emphasis differently than
		// it is done on GitHub.

		// it( 'should process nested emphasis #1', () => {
		// 	testDataProcessor(
		// 		'*test **test** test*',
		//
		// 		// GitHub is rendering as:
		// 		// <p><em>test *</em>test** test*</p>
		//
		// 		'<p><em>test *</em>test** test*</p>'
		// 	);
		// } );
		// it( 'should process nested emphasis #2', () => {
		// 	testDataProcessor(
		// 		'_test __test__ test_',
		//
		// 		// GitHub is rendering as:
		// 		'<p><em>test __test_</em> test_</p>'
		// 	);
		// } );
	} );
} );
