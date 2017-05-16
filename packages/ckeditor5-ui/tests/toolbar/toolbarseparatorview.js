/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ToolbarSeparatorView from '../../src/toolbar/toolbarseparatorview';

describe( 'ToolbarSeparatorView', () => {
	let view;

	beforeEach( () => {
		view = new ToolbarSeparatorView();

		return view.init();
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'SPAN' );
			expect( view.element.classList.contains( 'ck-toolbar__separator' ) ).to.true;
		} );
	} );
} );
