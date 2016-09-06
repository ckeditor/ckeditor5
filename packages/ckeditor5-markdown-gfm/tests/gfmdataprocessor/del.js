/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import { stringify } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'del', () => {
		describe( 'toView', () => {
			it( 'should process deleted text', () => {
				const viewFragment = dataProcessor.toView( '~~deleted~~' );

				expect( stringify( viewFragment ) ).to.equal( '<p><del>deleted</del></p>' );
			} );

			it( 'should process deleted inside text', () => {
				const viewFragment = dataProcessor.toView( 'This is ~~deleted content~~.' );

				expect( stringify( viewFragment ) ).to.equal( '<p>This is <del>deleted content</del>.</p>' );
			} );
		} );
	} );
} );
