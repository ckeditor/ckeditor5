/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';

import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { paragraphsToLists } from '../../src/filters/list';

describe( 'Filters – list', () => {
	const htmlDataProcessor = new HtmlDataProcessor();

	describe( 'paragraphsToLists', () => {
		it( 'replaces list-like elements with semantic lists', () => {
			const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
			const view = htmlDataProcessor.toView( html );

			const result = paragraphsToLists( { view } );

			expect( result.view.childCount ).to.equal( 1 );
			expect( result.view.getChild( 0 ).name ).to.equal( 'ol' );
			expect( stringify( result.view ) ).to.equal( '<ol><li style="mso-list:l0 level1 lfo0">Item 1</li></ol>' );
		} );

		it( 'has no effect if `data.view` is not set', () => {
			const result = paragraphsToLists( {} );

			expect( result ).to.empty;
		} );

		it( 'has no effect if `data.view` has no children', () => {
			const view = new DocumentFragment();
			const result = paragraphsToLists( { view } );

			expect( result.view.childCount ).to.equal( 0 );
		} );

		it( 'does not modify the view if there are no list-like elements', () => {
			const html = '<h1>H1</h1><p>Foo Bar</p>';
			const view = htmlDataProcessor.toView( html );

			const result = paragraphsToLists( { view } );

			expect( result.view.childCount ).to.equal( 2 );
			expect( stringify( result.view ) ).to.equal( html );
		} );

		it( 'can handle empty `mso-list` style', () => {
			const html = '<p style="mso-list:"><span style="mso-list:Ignore">1.</span>Item 1</p>';
			const view = htmlDataProcessor.toView( html );

			const result = paragraphsToLists( { view } );

			expect( result.view.childCount ).to.equal( 1 );
			expect( result.view.getChild( 0 ).name ).to.equal( 'ol' );
			expect( stringify( result.view ) ).to.equal( '<ol><li style="mso-list:">Item 1</li></ol>' );
		} );
	} );
} );
