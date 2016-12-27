/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, dropdown */

import ViewCollection from 'ckeditor5-ui/src/viewcollection';
import DropdownPanelView from 'ckeditor5-ui/src/dropdown/dropdownpanelview';

describe( 'DropdownPanelView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t() {} };

		return ( view = new DropdownPanelView( locale ) ).init();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets view#isVisible false', () => {
			expect( view.isVisible ).to.be.false;
		} );

		it( 'creates view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck-reset' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-dropdown__panel' ) ).to.be.true;
		} );

		describe( 'template bindings', () => {
			describe( 'class', () => {
				it( 'reacts on view#isVisible', () => {
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).to.be.false;

					view.isVisible = true;
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).to.be.true;

					view.isVisible = false;
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).to.be.false;
				} );
			} );
		} );
	} );
} );
