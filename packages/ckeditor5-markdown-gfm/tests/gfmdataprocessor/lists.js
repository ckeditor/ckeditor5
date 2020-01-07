/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor as test } from '../../tests/_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'lists', () => {
		it( 'should process tight asterisks', () => {
			test(
				'*	item 1\n' +
				'*	item 2\n' +
				'*	item 3',

				// GitHub renders it as (notice spaces before list items)
				// <ul>
				// <li>  item 1</li>
				// <li>  item 2</li>
				// <li>  item 3</li>
				// </ul>
				'<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>',

				// List will be normalized to 3-space representation.
				'*   item 1\n' +
				'*   item 2\n' +
				'*   item 3'
			);
		} );

		it( 'should process loose asterisks', () => {
			test(
				'*	item 1\n' +
				'\n' +
				'*	item 2\n' +
				'\n' +
				'*	item 3',

				// Loose lists are rendered with with paragraph inside.
				'<ul>' +
					'<li>' +
						'<p>item 1</p>' +
					'</li>' +
					'<li>' +
						'<p>item 2</p>' +
					'</li>' +
					'<li>' +
						'<p>item 3</p>' +
					'</li>' +
				'</ul>',

				// List will be normalized to 3-space representation.
				'*   item 1\n' +
				'\n' +
				'*   item 2\n' +
				'\n' +
				'*   item 3'
			);
		} );

		it( 'should process tight pluses', () => {
			test(
				'+	item 1\n' +
				'+	item 2\n' +
				'+	item 3',

				'<ul>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ul>',

				// List will be normalized to asterisks, 3-space representation.
				'*   item 1\n' +
				'*   item 2\n' +
				'*   item 3'
			);
		} );

		it( 'should process loose pluses', () => {
			test(
				'+	item 1\n' +
				'\n' +
				'+	item 2\n' +
				'\n' +
				'+	item 3',

				'<ul>' +
					'<li>' +
						'<p>item 1</p>' +
					'</li>' +
					'<li>' +
						'<p>item 2</p>' +
					'</li>' +
					'<li>' +
						'<p>item 3</p>' +
					'</li>' +
				'</ul>',

				// List will be normalized to asterisks, 3-space representation.
				'*   item 1\n' +
				'\n' +
				'*   item 2\n' +
				'\n' +
				'*   item 3'
			);
		} );

		it( 'should process tight minuses', () => {
			test(
				'-	item 1\n' +
				'-	item 2\n' +
				'-	item 3',

				'<ul>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ul>',

				// List will be normalized to asterisks, 3-space representation.
				'*   item 1\n' +
				'*   item 2\n' +
				'*   item 3'
			);
		} );

		it( 'should process loose minuses', () => {
			test(
				'-	item 1\n' +
				'\n' +
				'-	item 2\n' +
				'\n' +
				'-	item 3',

				'<ul>' +
					'<li>' +
						'<p>item 1</p>' +
					'</li>' +
					'<li>' +
						'<p>item 2</p>' +
					'</li>' +
					'<li>' +
						'<p>item 3</p>' +
					'</li>' +
				'</ul>',

				// List will be normalized to asterisks, 3-space representation.
				'*   item 1\n' +
				'\n' +
				'*   item 2\n' +
				'\n' +
				'*   item 3'
			);
		} );

		it( 'should process ordered list with tabs', () => {
			test(
				'1.	item 1\n' +
				'2.	item 2\n' +
				'3.	item 3',

				'<ol>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ol>',

				// List will be normalized to 2-space representation.
				'1.  item 1\n' +
				'2.  item 2\n' +
				'3.  item 3'
			);
		} );

		it( 'should process ordered list with spaces', () => {
			test(
				'1. item 1\n' +
				'2. item 2\n' +
				'3. item 3',

				'<ol>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ol>',

				// List will be normalized to 2-space representation.
				'1.  item 1\n' +
				'2.  item 2\n' +
				'3.  item 3'
			);
		} );

		it( 'should process loose ordered list with tabs', () => {
			test(
				'1.	item 1\n' +
				'\n' +
				'2.	item 2\n' +
				'\n' +
				'3.	item 3',

				'<ol>' +
					'<li>' +
						'<p>item 1</p>' +
					'</li>' +
					'<li>' +
						'<p>item 2</p>' +
					'</li>' +
					'<li>' +
						'<p>item 3</p>' +
					'</li>' +
				'</ol>',

				// List will be normalized to 2-space representation.
				'1.  item 1\n' +
				'\n' +
				'2.  item 2\n' +
				'\n' +
				'3.  item 3'
			);
		} );

		it( 'should process loose ordered list with spaces', () => {
			test(
				'1. item 1\n' +
				'\n' +
				'2. item 2\n' +
				'\n' +
				'3. item 3',

				'<ol>' +
					'<li>' +
						'<p>item 1</p>' +
					'</li>' +
					'<li>' +
						'<p>item 2</p>' +
					'</li>' +
					'<li>' +
						'<p>item 3</p>' +
					'</li>' +
				'</ol>',

				// List will be normalized to 2-space representation.
				'1.  item 1\n' +
				'\n' +
				'2.  item 2\n' +
				'\n' +
				'3.  item 3'
			);
		} );

		it( 'should process nested and mixed lists', () => {
			test(
				'1. First\n' +
				'2. Second:\n' +
				'	* Fee\n' +
				'	* Fie\n' +
				'	* Foe\n' +
				'3. Third',

				'<ol>' +
					'<li>First</li>' +
					'<li>Second:' +
						'<ul>' +
							'<li>Fee</li>' +
							'<li>Fie</li>' +
							'<li>Foe</li>' +
						'</ul>' +
					'</li>' +
					'<li>Third</li>' +
				'</ol>',

				// All lists will be normalized after converting back.
				'1.  First\n' +
				'2.  Second:\n' +
				'    *   Fee\n' +
				'    *   Fie\n' +
				'    *   Foe\n' +
				'3.  Third'
			);
		} );

		it( 'should process nested and mixed loose lists', () => {
			test(
				'1. First\n' +
				'\n' +
				'2. Second:\n' +
				'	* Fee\n' +
				'	* Fie\n' +
				'	* Foe\n' +
				'\n' +
				'3. Third',

				'<ol>' +
					'<li>' +
						'<p>First</p>' +
					'</li>' +
					'<li>' +
						'<p>Second:</p>' +
						'<ul>' +
							'<li>Fee</li>' +
							'<li>Fie</li>' +
							'<li>Foe</li>' +
						'</ul>' +
					'</li>' +
					'<li>' +
						'<p>Third</p>' +
					'</li>' +
				'</ol>',

				// All lists will be normalized after converting back.
				'1.  First\n' +
				'\n' +
				'2.  Second:\n' +
				'\n' +
				'    *   Fee\n' +
				'    *   Fie\n' +
				'    *   Foe\n' +
				'3.  Third'
			);
		} );

		it( 'should create same bullet from different list indicators', () => {
			test(
				'* test\n' +
				'+ test\n' +
				'- test',

				'<ul>' +
					'<li>test</li>' +
					'<li>test</li>' +
					'<li>test</li>' +
				'</ul>',

				// After converting back list items will be unified.
				'*   test\n' +
				'*   test\n' +
				'*   test'
			);
		} );
	} );
} );
