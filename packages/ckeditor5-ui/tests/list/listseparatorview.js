/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListSeparatorView from '../../src/list/listseparatorview';

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
