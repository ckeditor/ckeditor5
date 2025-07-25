/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';
import { MarkdownGfmDataProcessor } from '../../src/gfmdataprocessor.js';
import { HtmlDataProcessor } from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import { ViewDocument } from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'MarkdownGfmDataProcessor', () => {
	describe( 'lists', () => {
		it( 'should process tight asterisks', () => {
			testDataProcessor(
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

				// List will be normalized to 1-space representation.
				'* item 1\n' +
				'* item 2\n' +
				'* item 3'
			);
		} );

		it( 'should process loose asterisks', () => {
			testDataProcessor(
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

				// List will be normalized to 1-space representation.
				'* item 1\n' +
				'\n' +
				'* item 2\n' +
				'\n' +
				'* item 3'
			);
		} );

		it( 'should process tight pluses', () => {
			testDataProcessor(
				'+	item 1\n' +
				'+	item 2\n' +
				'+	item 3',

				'<ul>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ul>',

				// List will be normalized to asterisks, 1-space representation.
				'* item 1\n' +
				'* item 2\n' +
				'* item 3'
			);
		} );

		it( 'should process loose pluses', () => {
			testDataProcessor(
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

				// List will be normalized to asterisks, 1-space representation.
				'* item 1\n' +
				'\n' +
				'* item 2\n' +
				'\n' +
				'* item 3'
			);
		} );

		it( 'should process tight minuses', () => {
			testDataProcessor(
				'-	item 1\n' +
				'-	item 2\n' +
				'-	item 3',

				'<ul>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ul>',

				// List will be normalized to asterisks, 1-space representation.
				'* item 1\n' +
				'* item 2\n' +
				'* item 3'
			);
		} );

		it( 'should process loose minuses', () => {
			testDataProcessor(
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

				// List will be normalized to asterisks, 1-space representation.
				'* item 1\n' +
				'\n' +
				'* item 2\n' +
				'\n' +
				'* item 3'
			);
		} );

		it( 'should process ordered list with tabs', () => {
			testDataProcessor(
				'1.	item 1\n' +
				'2.	item 2\n' +
				'3.	item 3',

				'<ol>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ol>',

				// List will be normalized to 1-space representation.
				'1. item 1\n' +
				'2. item 2\n' +
				'3. item 3'
			);
		} );

		it( 'should process ordered list with spaces', () => {
			testDataProcessor(
				'1. item 1\n' +
				'2. item 2\n' +
				'3. item 3',

				'<ol>' +
					'<li>item 1</li>' +
					'<li>item 2</li>' +
					'<li>item 3</li>' +
				'</ol>',

				// List will be normalized to 1-space representation.
				'1. item 1\n' +
				'2. item 2\n' +
				'3. item 3'
			);
		} );

		it( 'should process loose ordered list with tabs', () => {
			testDataProcessor(
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

				// List will be normalized to 1-space representation.
				'1. item 1\n' +
				'\n' +
				'2. item 2\n' +
				'\n' +
				'3. item 3'
			);
		} );

		it( 'should process loose ordered list with spaces', () => {
			testDataProcessor(
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

				// List will be normalized to 1-space representation.
				'1. item 1\n' +
				'\n' +
				'2. item 2\n' +
				'\n' +
				'3. item 3'
			);
		} );

		it( 'should process nested and mixed lists', () => {
			testDataProcessor(
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
				'1. First\n' +
				'\n' +
				'2. Second:\n' +
				'\n' +
				'   * Fee\n' +
				'   * Fie\n' +
				'   * Foe\n' +
				'\n' +
				'3. Third'
			);
		} );

		it( 'should process nested and mixed loose lists', () => {
			testDataProcessor(
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
				'1. First\n' +
				'\n' +
				'2. Second:\n' +
				'\n' +
				'   * Fee\n' +
				'   * Fie\n' +
				'   * Foe\n' +
				'\n' +
				'3. Third'
			);
		} );

		it( 'should create different lists from different list indicators', () => {
			testDataProcessor(
				'* test\n' +
				'+ test\n' +
				'- test',

				'<ul>' +
					'<li>test</li>' +
				'</ul>' +
				'<ul>' +
					'<li>test</li>' +
				'</ul>' +
				'<ul>' +
					'<li>test</li>' +
				'</ul>',

				// After converting back list items will be unified.
				'* test\n' +
				'\n' +
				'- test\n' +
				'\n' +
				'* test'
			);
		} );
	} );

	describe( 'todo lists', () => {
		it( 'should process todo lists', () => {
			testDataProcessor(
				'* [ ] Item 1\n' +
				'* [x] Item 2',

				'<ul>' +
					'<li><input disabled="" type="checkbox"></input>Item 1</li>' +
					'<li><input checked="" disabled="" type="checkbox"></input>Item 2</li>' +
				'</ul>'
			);
		} );

		it( 'should handle nested todo lists', () => {
			testDataProcessor(
				'* [ ] 1\n' +
				'  * [ ] 2\n' +
				'    * [ ] 3',

				'<ul>' +
					'<li>' +
						'<input disabled="" type="checkbox"></input>1' +
						'<ul>' +
							'<li>' +
								'<input disabled="" type="checkbox"></input>2' +
								'<ul>' +
									'<li>' +
										'<input disabled="" type="checkbox"></input>3' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		/**
		 * This is a bug that is present in both `turndown` and `remark-gfm`.
		 *
		 * If the task list item has a code block in new line, the `[ ]` or `[x]`
		 * syntax will be escaped and treated as a regular text.
		 *
		 * https://github.com/micromark/micromark-extension-gfm-task-list-item/issues/4
		 */
		it( 'should process todo list with code block', () => {
			testDataProcessor(
				'* [ ]\n' +
				'  ```plaintext\n' +
				'  This is a code block.\n' +
				'  ```\n' +
				'* [ ] Foo.',

				'<ul>' +
					'<li>' +
						'[ ]' +
						'<pre><code class="language-plaintext">This is a code block.</code></pre>' +
					'</li>' +
					'<li>' +
						'<input disabled="" type="checkbox"></input>Foo.' +
					'</li>' +
				'</ul>',

				'* \\[ ]\n' +
				'  ```plaintext\n' +
				'  This is a code block.\n' +
				'  ```\n' +
				'* [ ] Foo.'
			);
		} );

		it( 'should process the HTML produced by the todo list feature', () => {
			const viewDocument = new ViewDocument( new StylesProcessor() );
			const htmlDataProcessor = new HtmlDataProcessor( viewDocument );
			const mdDataProcessor = new MarkdownGfmDataProcessor( viewDocument );

			const viewFragment = htmlDataProcessor.toView(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__label">' +
						'<input type="checkbox" disabled="disabled">' +
						'<span class="todo-list__label__description">Item 1</span>' +
					'</label></li>' +
					'<li><label class="todo-list__label">' +
						'<input type="checkbox" disabled="disabled" checked="checked">' +
						'<span class="todo-list__label__description">Item 2</span>' +
					'</label></li>' +
				'</ul>'
			);

			expect( mdDataProcessor.toData( viewFragment ) ).to.equal(
				'* [ ] Item 1\n' +
				'* [x] Item 2'
			);
		} );
	} );
} );
