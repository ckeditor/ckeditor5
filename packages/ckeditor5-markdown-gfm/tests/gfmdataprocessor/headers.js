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

	describe( 'headers', () => {
		describe( 'toView', () => {
			it( 'level 1 header #1', () => {
				const viewFragment = dataProcessor.toView( '# Level 1' );

				expect( stringify( viewFragment ) ).to.equal( '<h1 id="level-1">Level 1</h1>' );
			} );

			it( 'level 1 header #2', () => {
				const viewFragment = dataProcessor.toView( 'Level 1\n===' );

				expect( stringify( viewFragment ) ).to.equal( '<h1 id="level-1">Level 1</h1>' );
			} );

			it( 'level 2 header #1', () => {
				const viewFragment = dataProcessor.toView( '## Level 2' );

				expect( stringify( viewFragment ) ).to.equal( '<h2 id="level-2">Level 2</h2>' );
			} );

			it( 'level 2 header #2', () => {
				const viewFragment = dataProcessor.toView( 'Level 2\n---' );

				expect( stringify( viewFragment ) ).to.equal( '<h2 id="level-2">Level 2</h2>' );
			} );

			it( 'level 3 header', () => {
				const viewFragment = dataProcessor.toView( '### Level 3' );

				expect( stringify( viewFragment ) ).to.equal( '<h3 id="level-3">Level 3</h3>' );
			} );

			it( 'level 4 header', () => {
				const viewFragment = dataProcessor.toView( '#### Level 4' );

				expect( stringify( viewFragment ) ).to.equal( '<h4 id="level-4">Level 4</h4>' );
			} );

			it( 'level 5 header', () => {
				const viewFragment = dataProcessor.toView( '##### Level 5' );

				expect( stringify( viewFragment ) ).to.equal( '<h5 id="level-5">Level 5</h5>' );
			} );

			it( 'level 6 header', () => {
				const viewFragment = dataProcessor.toView( '###### Level 6' );

				expect( stringify( viewFragment ) ).to.equal( '<h6 id="level-6">Level 6</h6>' );
			} );

			it( 'should create header when more spaces before text', () => {
				const viewFragment = dataProcessor.toView( '#      Level 1' );

				expect( stringify( viewFragment ) ).to.equal( '<h1 id="level-1">Level 1</h1>' );
			} );
		} );
	} );
} );
