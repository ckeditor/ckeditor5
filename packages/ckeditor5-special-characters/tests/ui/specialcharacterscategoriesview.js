/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpecialCharactersCategoriesView } from '../../src/ui/specialcharacterscategoriesview.js';
import { View, LabeledFieldView } from '@ckeditor/ckeditor5-ui';

describe( 'SpecialCharactersCategoriesView', () => {
	let view, locale;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		view = new SpecialCharactersCategoriesView( locale, new Map( [
			[ 'groupA', 'labelA' ],
			[ 'groupB', 'labelB' ]
		] ) );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should be an instance of the View', () => {
			expect( view ).toBeInstanceOf( View );
		} );

		it( 'creates #dropdownView', () => {
			expect( view._dropdownView ).toBeInstanceOf( LabeledFieldView );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-character-categories' ) ).toBe( true );

			expect( view.element.firstChild.classList.contains( 'ck-labeled-field-view' ) ).toBe( true );
		} );
	} );

	describe( 'currentGroupName()', () => {
		it( 'returns the #value of #dropdownView', () => {
			view._dropdownView.fieldView.isOpen = true;

			expect( view.currentGroupName ).toBe( 'groupA' );

			view._dropdownView.fieldView.listView.items.last.children.first.fire( 'execute' );
			expect( view.currentGroupName ).toBe( 'groupB' );
		} );
	} );

	describe( '#dropdownView', () => {
		let groupDropdownView;

		beforeEach( () => {
			groupDropdownView = view._dropdownView.fieldView;
			groupDropdownView.isOpen = true;
		} );

		it( 'has a default #value', () => {
			expect( view.currentGroupName ).toBe( 'groupA' );
		} );

		it( 'has a right #panelPosition (LTR)', () => {
			expect( groupDropdownView.panelPosition ).toBe( 'sw' );
		} );

		it( 'has a right #panelPosition (RTL)', () => {
			const locale = {
				uiLanguageDirection: 'rtl',
				t: val => val
			};

			view = new SpecialCharactersCategoriesView( locale, new Map( [
				[ 'groupA', 'labelA' ],
				[ 'groupB', 'labelB' ]
			] ) );
			view.render();

			expect( view._dropdownView.fieldView.panelPosition ).toBe( 'se' );

			view.destroy();
		} );

		describe( 'buttonView', () => {
			it( 'binds #label to translation #value', () => {
				expect( groupDropdownView.buttonView.label ).toBe( 'labelA' );

				groupDropdownView.listView.items.last.children.first.fire( 'execute' );
				expect( groupDropdownView.buttonView.label ).toBe( 'labelB' );
			} );

			it( 'should be configured by the #dropdownView', () => {
				expect( groupDropdownView.buttonView.isOn ).toBe( true );
				expect( groupDropdownView.buttonView.withText ).toBe( true );
				expect( groupDropdownView.buttonView.tooltip ).toBe( 'Category' );
				expect( groupDropdownView.buttonView.ariaLabel ).toBe( 'Category' );
				expect( groupDropdownView.buttonView.ariaLabelledBy ).toBeUndefined();
			} );
		} );

		describe( 'character group list', () => {
			it( 'should have properties set', () => {
				const listView = groupDropdownView.listView;

				expect( listView.element.role ).toBe( 'menu' );
				expect( listView.element.ariaLabel ).toBe( 'Category' );
			} );
		} );

		describe( 'character group list items', () => {
			it( 'have basic properties', () => {
				expect( groupDropdownView.listView.items
					.map( item => {
						const { name, label, role, withText } = item.children.first;

						return { name, label, role, withText };
					} ) )
					.toEqual( [
						{ name: 'groupA', label: 'labelA', role: 'menuitemradio', withText: true },
						{ name: 'groupB', label: 'labelB', role: 'menuitemradio', withText: true }
					] );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the character categories dropdown', () => {
			const spy = vi.spyOn( view._dropdownView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
