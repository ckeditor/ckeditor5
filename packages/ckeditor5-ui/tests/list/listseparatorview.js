/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListSeparatorView from '../../src/list/listseparatorview.js';

describe( 'ListSeparatorView', () => {
	let view;

	beforeEach( () => {
		view = new ListSeparatorView();

		view.render();
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'LI' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-list__separator' ) ).to.true;
		} );
	} );
} );
