/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'headers', () => {
		it( 'should process level 1 header #1', () => {
			testDataProcessor(
				'# Level 1',

				'<h1>Level 1</h1>'
			);
		} );

		it( 'should process level 1 header #2', () => {
			testDataProcessor(
				'Level 1\n' +
				'===',

				'<h1>Level 1</h1>',

				// When converting back it will be normalized to # representation.
				'# Level 1'
			);
		} );

		it( 'should process level 2 header #1', () => {
			testDataProcessor(
				'## Level 2',

				'<h2>Level 2</h2>'
			);
		} );

		it( 'should process level 2 header #2', () => {
			testDataProcessor(
				'Level 2\n' +
				'---',

				'<h2>Level 2</h2>',

				// When converting back it will be normalized to ## representation.
				'## Level 2'
			);
		} );

		it( 'should process level 3 header', () => {
			testDataProcessor(
				'### Level 3',

				'<h3>Level 3</h3>'
			);
		} );

		it( 'should process level 4 header', () => {
			testDataProcessor(
				'#### Level 4',

				'<h4>Level 4</h4>'
			);
		} );

		it( 'should process level 5 header', () => {
			testDataProcessor(
				'##### Level 5',

				'<h5>Level 5</h5>'
			);
		} );

		it( 'should process level 6 header', () => {
			testDataProcessor(
				'###### Level 6',

				'<h6>Level 6</h6>'
			);
		} );

		it( 'should create header when more spaces before text', () => {
			testDataProcessor(
				'#      Level 1',

				'<h1>Level 1</h1>',

				// When converting back it will be normalized to # Level 1.
				'# Level 1'
			);
		} );

		it( 'should process headers placed next to each other #1', () => {
			testDataProcessor(
				'# header\n' +
				'# header',

				'<h1>header</h1><h1>header</h1>',

				'# header\n' +
				'\n' +
				'# header'
			);
		} );

		it( 'should process headers placed next to each other #2', () => {
			testDataProcessor(
				'# header\n' +
				'## header\n' +
				'### header',

				'<h1>header</h1><h2>header</h2><h3>header</h3>',

				'# header\n' +
				'\n' +
				'## header\n' +
				'\n' +
				'### header'
			);
		} );

		it( 'should process headers followed by a paragraph', () => {
			testDataProcessor(
				'# header\n\n' +
				'paragraph',

				'<h1>header</h1><p>paragraph</p>'
			);
		} );
	} );
} );
