/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'paragraphs', () => {
		it( 'single line', () => {
			testDataProcessor(
				'single line paragraph',

				'<p>single line paragraph</p>'
			);
		} );

		it( 'multiline', () => {
			testDataProcessor(
				'first\n' +
				'second\n' +
				'third',

				// GitHub is rendering as:
				// <p>first<br>
				// second<br>
				// third</p>
				'<p>first<br></br>second<br></br>third</p>'
			);
		} );

		it( 'with header after #1', () => {
			testDataProcessor(
				'single line\n' +
				'# header',

				// GitHub is rendering as:
				// <p>single line</p>
				//
				// <h1>header</h1>
				'<p>single line</p><h1>header</h1>',

				'single line\n' +
				'\n' +
				'# header'
			);
		} );

		it( 'with blockquote after', () => {
			testDataProcessor(
				'single line' +
				'\n> quote',

				// GitHub is rendereing as:
				// <p>single line</p>
				//
				// <blockquote>
				// <p>quote</p>
				// </blockquote>
				'<p>single line</p><blockquote><p>quote</p></blockquote>',

				'single line' +
				'\n' +
				'\n> quote'
			);
		} );

		it( 'with list after', () => {
			testDataProcessor(
				'single line\n' +
				'*   item',

				// GitHub is rendering as:
				// <p>single line</p>
				//
				// <ul>
				// <li>item</li>
				// </ul>
				'<p>single line</p><ul><li>item</li></ul>',

				'single line\n' +
				'\n' +
				'*   item'
			);
		} );
	} );
} );
