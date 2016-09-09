/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'strong and emphasis', () => {
		describe( 'toView', () => {
			it( 'should process strong', () => {
				const viewFragment = dataProcessor.toView( '**this is strong** and __this too__' );

				expect( stringify( viewFragment ) ).to.equal( '<p><strong>this is strong</strong> and <strong>this too</strong></p>' );
			} );

			it( 'should process emphasis', () => {
				const viewFragment = dataProcessor.toView( '*this is emphasis* and _this too_' );

				expect( stringify( viewFragment ) ).to.equal( '<p><em>this is emphasis</em> and <em>this too</em></p>' );
			} );

			it( 'should process strong and emphasis together #1', () => {
				const viewFragment = dataProcessor.toView( '***This is strong and em.***' );

				expect( stringify( viewFragment ) ).to.equal( '<p><strong><em>This is strong and em.</em></strong></p>' );
			} );

			it( 'should process strong and emphasis together #2', () => {
				const viewFragment = dataProcessor.toView( 'Single ***word*** is strong and em.' );

				expect( stringify( viewFragment ) ).to.equal( '<p>Single <strong><em>word</em></strong> is strong and em.</p>' );
			} );

			it( 'should process strong and emphasis together #3', () => {
				const viewFragment = dataProcessor.toView( '___This is strong and em.___' );

				expect( stringify( viewFragment ) ).to.equal( '<p><strong><em>This is strong and em.</em></strong></p>' );
			} );

			it( 'should process strong and emphasis together #4', () => {
				const viewFragment = dataProcessor.toView( 'Single ___word___ is strong and em.' );

				expect( stringify( viewFragment ) ).to.equal( '<p>Single <strong><em>word</em></strong> is strong and em.</p>' );
			} );

			it( 'should not process emphasis inside words', () => {
				const viewFragment = dataProcessor.toView( 'This should_not_be_emp.' );

				expect( stringify( viewFragment ) ).to.equal( '<p>This should_not_be_emp.</p>' );
			} );

			it( 'should process nested emphasis #1', () => {
				const viewFragment = dataProcessor.toView( '*test **test** test*' );

				expect( stringify( viewFragment ) ).to.equal( '<p><em>test <strong>test</strong> test</em></p>' );
			} );

			it( 'should process nested emphasis #2', () => {
				const viewFragment = dataProcessor.toView( '_test __test__ test_' );

				expect( stringify( viewFragment ) ).to.equal( '<p><em>test <strong>test</strong> test</em></p>' );
			} );
		} );

		describe( 'toData', () => {
			it( 'should process strong', () => {
				const viewFragment = parse( '<p><strong>strong</strong> and <strong>this too</strong></p>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '**strong** and **this too**' );
			} );

			it( 'should process emphasis', () => {
				const viewFragment = parse( '<p><em>emphasis</em> and <em>this too</em></p>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '_emphasis_ and _this too_' );
			} );

			it( 'should process strong and emphasis together #1', () => {
				const viewFragment = parse( '<p><strong><em>This is strong and em.</em></strong></p>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '**_This is strong and em._**' );
			} );

			it( 'should process strong and emphasis together #2', () => {
				const viewFragment = parse( '<p><em><strong>This is strong and em.</strong></em></p>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '_**This is strong and em.**_' );
			} );
		} );
	} );
} );
