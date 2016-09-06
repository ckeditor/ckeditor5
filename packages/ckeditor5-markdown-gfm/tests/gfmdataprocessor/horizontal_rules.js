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

	describe( 'horizontal rules', () => {
		describe( 'toView', () => {
			describe( 'dashes', () => {
				it( '#1', () => {
					const viewFragment = dataProcessor.toView( '---' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#2', () => {
					const viewFragment = dataProcessor.toView( ' ---' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#3', () => {
					const viewFragment = dataProcessor.toView( '  ---' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#4', () => {
					const viewFragment = dataProcessor.toView( '   ---' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#5 - code', () => {
					const viewFragment = dataProcessor.toView( '	---' );

					expect( stringify( viewFragment ) ).to.equal( '<pre><code>---</code></pre>' );
				} );
			} );

			describe( 'dashes with spaces', () => {
				it( '#1', () => {
					const viewFragment = dataProcessor.toView( '- - -' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#2', () => {
					const viewFragment = dataProcessor.toView( ' - - -' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#3', () => {
					const viewFragment = dataProcessor.toView( '  - - -' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#4', () => {
					const viewFragment = dataProcessor.toView( '   - - -' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#5 - code', () => {
					const viewFragment = dataProcessor.toView( '	- - -' );

					expect( stringify( viewFragment ) ).to.equal( '<pre><code>- - -</code></pre>' );
				} );
			} );

			describe( 'asterisks', () => {
				it( '#1', () => {
					const viewFragment = dataProcessor.toView( '***' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#2', () => {
					const viewFragment = dataProcessor.toView( ' ***' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#3', () => {
					const viewFragment = dataProcessor.toView( '  ***' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#4', () => {
					const viewFragment = dataProcessor.toView( '   ***' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#5 - code', () => {
					const viewFragment = dataProcessor.toView( '	***' );

					expect( stringify( viewFragment ) ).to.equal( '<pre><code>***</code></pre>' );
				} );
			} );

			describe( 'asterisks with spaces', () => {
				it( '#1', () => {
					const viewFragment = dataProcessor.toView( '* * *' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#2', () => {
					const viewFragment = dataProcessor.toView( ' * * *' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#3', () => {
					const viewFragment = dataProcessor.toView( '  * * *' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#4', () => {
					const viewFragment = dataProcessor.toView( '   * * *' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#5 - code', () => {
					const viewFragment = dataProcessor.toView( '	* * *' );

					expect( stringify( viewFragment ) ).to.equal( '<pre><code>* * *</code></pre>' );
				} );
			} );

			describe( 'underscores', () => {
				it( '#1', () => {
					const viewFragment = dataProcessor.toView( '___' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#2', () => {
					const viewFragment = dataProcessor.toView( ' ___' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#3', () => {
					const viewFragment = dataProcessor.toView( '  ___' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#4', () => {
					const viewFragment = dataProcessor.toView( '   ___' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#5 - code', () => {
					const viewFragment = dataProcessor.toView( '	___' );

					expect( stringify( viewFragment ) ).to.equal( '<pre><code>___</code></pre>' );
				} );
			} );

			describe( 'underscores with spaces', () => {
				it( '#1', () => {
					const viewFragment = dataProcessor.toView( '_ _ _' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#2', () => {
					const viewFragment = dataProcessor.toView( ' _ _ _' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#3', () => {
					const viewFragment = dataProcessor.toView( '  _ _ _' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#4', () => {
					const viewFragment = dataProcessor.toView( '   _ _ _' );

					expect( stringify( viewFragment ) ).to.equal( '<hr></hr>' );
				} );

				it( '#5 - code', () => {
					const viewFragment = dataProcessor.toView( '	_ _ _' );

					expect( stringify( viewFragment ) ).to.equal( '<pre><code>_ _ _</code></pre>' );
				} );
			} );
		} );
	} );
} );
