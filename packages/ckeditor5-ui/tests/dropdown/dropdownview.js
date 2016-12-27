/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, dropdown */

import DropdownView from 'ckeditor5-ui/src/dropdown/dropdownview';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import DropdownPanelView from 'ckeditor5-ui/src/dropdown/dropdownpanelview';

describe( 'DropdownView', () => {
	let view, buttonView, panelView, locale;

	beforeEach( () => {
		locale = { t() {} };

		buttonView = new ButtonView( locale );
		panelView = new DropdownPanelView( locale );

		return ( view = new DropdownView( locale, buttonView, panelView ) ).init();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets view#buttonView', () => {
			expect( view.buttonView ).to.equal( buttonView );
		} );

		it( 'sets view#panelView', () => {
			expect( view.panelView ).to.equal( panelView );
		} );

		it( 'sets view#isOpen false', () => {
			expect( view.isOpen ).to.be.false;
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck-dropdown' ) ).to.be.true;
			expect( view.element.firstChild ).to.equal( buttonView.element );
			expect( view.element.lastChild ).to.equal( panelView.element );
		} );

		it( 'sets view#buttonView class', () => {
			expect( view.buttonView.element.classList.contains( 'ck-dropdown__button' ) ).to.be.true;
		} );

		describe( 'bindings', () => {
			describe( 'view#isOpen to view.buttonView#execute', () => {
				it( 'is activated', () => {
					const values = [];

					view.on( 'change:isOpen', () => {
						values.push( view.isOpen );
					} );

					view.buttonView.fire( 'execute' );
					view.buttonView.fire( 'execute' );
					view.buttonView.fire( 'execute' );

					expect( values ).to.have.members( [ true, false, true ] );
				} );
			} );

			describe( 'view.panelView#isVisible to view#isOpen', () => {
				it( 'is activated', () => {
					const values = [];

					view.listenTo( view.panelView, 'change:isVisible', () => {
						values.push( view.isOpen );
					} );

					view.isOpen = true;
					view.isOpen = false;
					view.isOpen = true;

					expect( values ).to.have.members( [ true, false, true ] );
				} );
			} );
		} );
	} );
} );
