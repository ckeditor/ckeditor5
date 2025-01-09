/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ToolbarSeparatorView from '../../src/toolbar/toolbarseparatorview.js';

describe( 'ToolbarSeparatorView', () => {
	let view;

	beforeEach( () => {
		view = new ToolbarSeparatorView();

		view.render();
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'SPAN' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-toolbar__separator' ) ).to.true;
		} );
	} );
} );
