/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ToolbarLineBreakView from '../../src/toolbar/toolbarlinebreakview.js';

describe( 'ToolbarLineBreakView', () => {
	let view;

	beforeEach( () => {
		view = new ToolbarLineBreakView();

		view.render();
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'SPAN' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-toolbar__line-break' ) ).to.true;
		} );
	} );
} );
