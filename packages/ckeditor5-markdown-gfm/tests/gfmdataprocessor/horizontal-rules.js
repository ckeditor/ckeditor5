/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor } from '../_utils/utils';

describe( 'GFMDataProcessor', () => {
	// Horizontal rules are are always rendered by GitHub as <hr> and normalized when converting
	// back to * * *.
	describe( 'horizontal rules', () => {
		describe( 'dashes', () => {
			it( '#1', () => {
				testDataProcessor( '---', '<hr></hr>', '* * *' );
			} );

			it( '#2', () => {
				testDataProcessor( ' ---', '<hr></hr>', '* * *' );
			} );

			it( '#3', () => {
				testDataProcessor( '  ---', '<hr></hr>', '* * *' );
			} );

			it( '#4', () => {
				testDataProcessor( '   ---', '<hr></hr>', '* * *' );
			} );

			it( '#5 - code', () => {
				testDataProcessor(
					'    ---',

					// Four spaces are interpreted as code block.
					'<pre><code>---</code></pre>',

					// Code block will be normalized to ``` representation.
					'```\n' +
					'---\n' +
					'```'
				);
			} );
		} );

		describe( 'dashes with spaces', () => {
			it( '#1', () => {
				testDataProcessor( '- - -', '<hr></hr>', '* * *' );
			} );

			it( '#2', () => {
				testDataProcessor( ' - - -', '<hr></hr>', '* * *' );
			} );

			it( '#3', () => {
				testDataProcessor( '  - - -', '<hr></hr>', '* * *' );
			} );

			it( '#4', () => {
				testDataProcessor( '   - - -', '<hr></hr>', '* * *' );
			} );

			it( '#5 - code', () => {
				testDataProcessor(
					'    - - -',

					// Four spaces are interpreted as code block.
					'<pre><code>- - -</code></pre>',

					// Code block will be normalized to ``` representation.
					'```\n' +
					'- - -\n' +
					'```'
				);
			} );
		} );

		describe( 'asterisks', () => {
			it( '#1', () => {
				testDataProcessor( '***', '<hr></hr>', '* * *' );
			} );

			it( '#2', () => {
				testDataProcessor( ' ***', '<hr></hr>', '* * *' );
			} );

			it( '#3', () => {
				testDataProcessor( '  ***', '<hr></hr>', '* * *' );
			} );

			it( '#4', () => {
				testDataProcessor( '   ***', '<hr></hr>', '* * *' );
			} );

			it( '#5 - code', () => {
				testDataProcessor(
					'    ***',

					// Four spaces are interpreted as code block.
					'<pre><code>***</code></pre>',

					// Code block will be normalized to ``` representation.
					'```\n' +
					'***\n' +
					'```'
				);
			} );
		} );

		describe( 'asterisks with spaces', () => {
			it( '#1', () => {
				testDataProcessor( '* * *', '<hr></hr>', '* * *' );
			} );

			it( '#2', () => {
				testDataProcessor( ' * * *', '<hr></hr>', '* * *' );
			} );

			it( '#3', () => {
				testDataProcessor( '  * * *', '<hr></hr>', '* * *' );
			} );

			it( '#4', () => {
				testDataProcessor( '   * * *', '<hr></hr>', '* * *' );
			} );

			it( '#5 - code', () => {
				testDataProcessor(
					'    * * *',

					// Four spaces are interpreted as code block.
					'<pre><code>* * *</code></pre>',

					// Code block will be normalized to ``` representation.
					'```\n' +
					'* * *\n' +
					'```'
				);
			} );
		} );

		describe( 'underscores', () => {
			it( '#1', () => {
				testDataProcessor( '___', '<hr></hr>', '* * *' );
			} );

			it( '#2', () => {
				testDataProcessor( ' ___', '<hr></hr>', '* * *' );
			} );

			it( '#3', () => {
				testDataProcessor( '  ___', '<hr></hr>', '* * *' );
			} );

			it( '#4', () => {
				testDataProcessor( '   ___', '<hr></hr>', '* * *' );
			} );

			it( '#5 - code', () => {
				testDataProcessor(
					'    ___',

					// Four spaces are interpreted as code block.
					'<pre><code>___</code></pre>',

					// Code block will be normalized to ``` representation.
					'```\n' +
					'___\n' +
					'```'
				);
			} );
		} );

		describe( 'underscores with spaces', () => {
			it( '#1', () => {
				testDataProcessor( '_ _ _', '<hr></hr>', '* * *' );
			} );

			it( '#2', () => {
				testDataProcessor( ' _ _ _', '<hr></hr>', '* * *' );
			} );

			it( '#3', () => {
				testDataProcessor( '  _ _ _', '<hr></hr>', '* * *' );
			} );

			it( '#4', () => {
				testDataProcessor( '   _ _ _', '<hr></hr>', '* * *' );
			} );

			it( '#5 - code', () => {
				testDataProcessor(
					'    _ _ _',

					// Four spaces are interpreted as code block.
					'<pre><code>_ _ _</code></pre>',

					// Code block will be normalized to ``` representation.
					'```\n' +
					'_ _ _\n' +
					'```'
				);
			} );
		} );
	} );
} );
