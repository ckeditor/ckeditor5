/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import SearchResultsView from '../../src/search/searchresultsview';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { ButtonView, ViewCollection } from '../../src';

describe( 'SearchResultsView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();

		view = new SearchResultsView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates and element from template with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-search__results' ) ).to.be.true;
		} );

		it( 'has a collection of #children', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );

			view.children.add( new ButtonView() );

			expect( view.element.firstChild ).to.equal( view.children.first.element );
		} );
	} );
} );
