/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SpecialCharactersCategoriesView from '../../src/ui/specialcharacterscategoriesview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import { LabeledFieldView } from '@ckeditor/ckeditor5-ui';

describe( 'SpecialCharactersCategoriesView', () => {
	let view, locale;

	testUtils.createSinonSandbox();

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
	} );

	describe( 'constructor()', () => {
		it( 'should be an instance of the View', () => {
			expect( view ).to.be.instanceOf( View );
		} );

		it( 'creates #dropdownView', () => {
			expect( view._dropdownView ).to.be.instanceOf( LabeledFieldView );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-character-categories' ) ).to.be.true;

			expect( view.element.firstChild.classList.contains( 'ck-labeled-field-view' ) ).to.be.true;
		} );
	} );

	describe( 'currentGroupName()', () => {
		it( 'returns the #value of #dropdownView', () => {
			view._dropdownView.fieldView.isOpen = true;

			expect( view.currentGroupName ).to.equal( 'groupA' );

			view._dropdownView.fieldView.listView.items.last.children.first.fire( 'execute' );
			expect( view.currentGroupName ).to.equal( 'groupB' );
		} );
	} );

	describe( '#dropdownView', () => {
		let groupDropdownView;

		beforeEach( () => {
			groupDropdownView = view._dropdownView.fieldView;
			groupDropdownView.isOpen = true;
		} );

		it( 'has a default #value', () => {
			expect( view.currentGroupName ).to.equal( 'groupA' );
		} );

		it( 'has a right #panelPosition (LTR)', () => {
			expect( groupDropdownView.panelPosition ).to.equal( 'sw' );
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

			expect( view._dropdownView.fieldView.panelPosition ).to.equal( 'se' );

			view.destroy();
		} );

		describe( 'buttonView', () => {
			it( 'binds #label to translation #value', () => {
				expect( groupDropdownView.buttonView.label ).to.equal( 'labelA' );

				groupDropdownView.listView.items.last.children.first.fire( 'execute' );
				expect( groupDropdownView.buttonView.label ).to.equal( 'labelB' );
			} );

			it( 'should be configured by the #dropdownView', () => {
				expect( groupDropdownView.buttonView.isOn ).to.be.true;
				expect( groupDropdownView.buttonView.withText ).to.be.true;
				expect( groupDropdownView.buttonView.tooltip ).to.equal( 'Category' );
				expect( groupDropdownView.buttonView.ariaLabel ).to.equal( 'Category' );
				expect( groupDropdownView.buttonView.ariaLabelledBy ).to.be.undefined;
			} );
		} );

		describe( 'character group list', () => {
			it( 'should have properties set', () => {
				const listView = groupDropdownView.listView;

				expect( listView.element.role ).to.equal( 'menu' );
				expect( listView.element.ariaLabel ).to.equal( 'Category' );
			} );
		} );

		describe( 'character group list items', () => {
			it( 'have basic properties', () => {
				expect( groupDropdownView.listView.items
					.map( item => {
						const { name, label, role, withText } = item.children.first;

						return { name, label, role, withText };
					} ) )
					.to.deep.equal( [
						{ name: 'groupA', label: 'labelA', role: 'menuitemradio', withText: true },
						{ name: 'groupB', label: 'labelB', role: 'menuitemradio', withText: true }
					] );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the character categories dropdown', () => {
			const spy = sinon.spy( view._dropdownView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
