/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'headers', () => {
		describe( 'toView', () => {
			it( 'should process level 1 header #1', () => {
				const viewFragment = dataProcessor.toView( '# Level 1' );

				expect( stringify( viewFragment ) ).to.equal( '<h1 id="level-1">Level 1</h1>' );
			} );

			it( 'should process level 1 header #2', () => {
				const viewFragment = dataProcessor.toView( 'Level 1\n===' );

				expect( stringify( viewFragment ) ).to.equal( '<h1 id="level-1">Level 1</h1>' );
			} );

			it( 'should process level 2 header #1', () => {
				const viewFragment = dataProcessor.toView( '## Level 2' );

				expect( stringify( viewFragment ) ).to.equal( '<h2 id="level-2">Level 2</h2>' );
			} );

			it( 'should process level 2 header #2', () => {
				const viewFragment = dataProcessor.toView( 'Level 2\n---' );

				expect( stringify( viewFragment ) ).to.equal( '<h2 id="level-2">Level 2</h2>' );
			} );

			it( 'should process level 3 header', () => {
				const viewFragment = dataProcessor.toView( '### Level 3' );

				expect( stringify( viewFragment ) ).to.equal( '<h3 id="level-3">Level 3</h3>' );
			} );

			it( 'should process level 4 header', () => {
				const viewFragment = dataProcessor.toView( '#### Level 4' );

				expect( stringify( viewFragment ) ).to.equal( '<h4 id="level-4">Level 4</h4>' );
			} );

			it( 'should process level 5 header', () => {
				const viewFragment = dataProcessor.toView( '##### Level 5' );

				expect( stringify( viewFragment ) ).to.equal( '<h5 id="level-5">Level 5</h5>' );
			} );

			it( 'should process level 6 header', () => {
				const viewFragment = dataProcessor.toView( '###### Level 6' );

				expect( stringify( viewFragment ) ).to.equal( '<h6 id="level-6">Level 6</h6>' );
			} );

			it( 'should create header when more spaces before text', () => {
				const viewFragment = dataProcessor.toView( '#      Level 1' );

				expect( stringify( viewFragment ) ).to.equal( '<h1 id="level-1">Level 1</h1>' );
			} );
		} );

		describe( 'toData', () => {
			let viewFragment;

			beforeEach( () => {
				viewFragment = new DocumentFragment();
			} );

			it( 'should process level 1 header', () => {
				viewFragment.appendChildren( parse( '<h1 id="level-1">Level 1</h1>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '# Level 1' );
			} );

			it( 'should process level 2 header', () => {
				viewFragment.appendChildren( parse( '<h2 id="level-2">Level 2</h2>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '## Level 2' );
			} );

			it( 'should process level 3 header', () => {
				viewFragment.appendChildren( parse( '<h3 id="level-3">Level 3</h3>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '### Level 3' );
			} );

			it( 'should process level 4 header', () => {
				viewFragment.appendChildren( parse( '<h4 id="level-4">Level 4</h4>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '#### Level 4' );
			} );

			it( 'should process level 5 header', () => {
				viewFragment.appendChildren( parse( '<h5 id="level-5">Level 5</h5>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '##### Level 5' );
			} );

			it( 'should process level 6 header', () => {
				viewFragment.appendChildren( parse( '<h6 id="level-6">Level 6</h6>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '###### Level 6' );
			} );
		} );
	} );
} );
