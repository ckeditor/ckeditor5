/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { transformParagraphsToLists } from '../../src/filters/list';

describe( 'Filters – list', () => {
	const htmlDataProcessor = new HtmlDataProcessor();

	describe( 'transformParagraphsToLists', () => {
		it( 'replaces list-like elements with semantic lists', () => {
			const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
			const view = htmlDataProcessor.toView( html );

			const result = transformParagraphsToLists( view, '' );

			expect( result.childCount ).to.equal( 1 );
			expect( result.getChild( 0 ).name ).to.equal( 'ol' );
			expect( stringify( result ) ).to.equal( '<ol><li style="mso-list:l0 level1 lfo0">Item 1</li></ol>' );
		} );

		it( 'replaces list-like elements with semantic lists with proper bullet type based on styles', () => {
			const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
			const view = htmlDataProcessor.toView( html );

			const result = transformParagraphsToLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' );

			expect( result.childCount ).to.equal( 1 );
			expect( result.getChild( 0 ).name ).to.equal( 'ul' );
			expect( stringify( result ) ).to.equal( '<ul><li style="mso-list:l0 level1 lfo0">Item 1</li></ul>' );
		} );

		it( 'does not modify the view if there are no list-like elements', () => {
			const html = '<h1>H1</h1><p>Foo Bar</p>';
			const view = htmlDataProcessor.toView( html );

			const result = transformParagraphsToLists( view, '' );

			expect( result.childCount ).to.equal( 2 );
			expect( stringify( result ) ).to.equal( html );
		} );

		it( 'handles empty `mso-list` style correctly', () => {
			const html = '<p style="mso-list:"><span style="mso-list:Ignore">1.</span>Item 1</p>';
			const view = htmlDataProcessor.toView( html );

			const result = transformParagraphsToLists( view, '' );

			expect( result.childCount ).to.equal( 1 );
			expect( result.getChild( 0 ).name ).to.equal( 'ol' );
			expect( stringify( result ) ).to.equal( '<ol><li style="mso-list:">Item 1</li></ol>' );
		} );

		it( 'handles empty body correctly', () => {
			const view = htmlDataProcessor.toView( '' );

			const result = transformParagraphsToLists( view, '' );

			expect( result.childCount ).to.equal( 0 );
			expect( stringify( result ) ).to.equal( '' );
		} );
	} );
} );
