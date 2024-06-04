/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpecialCharactersNavigationView from '../../src/ui/specialcharactersnavigationview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';

describe( 'SpecialCharactersNavigationView', () => {
	let view, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		view = new SpecialCharactersNavigationView( locale, new Map( [
			[ 'groupA', 'labelA' ],
			[ 'groupB', 'labelB' ]
		] ) );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should be an instance of the FormHeaderView', () => {
			expect( view ).to.be.instanceOf( FormHeaderView );
		} );

		it( 'should have "Special characters" label', () => {
			expect( view.label ).to.equal( 'Special characters' );
		} );

		it( 'creates #groupDropdownView', () => {
			expect( view.groupDropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-special-characters-navigation' ) ).to.be.true;

			expect( view.element.firstChild.classList.contains( 'ck-form__header__label' ) ).to.be.true;
			expect( view.element.lastChild.classList.contains( 'ck-dropdown' ) ).to.be.true;
		} );

		it( 'should contain following instances as children: View, Dropdown', () => {
			expect( view.children.first ).to.be.instanceOf( View );
			expect( view.children.last ).to.be.instanceOf( DropdownView );
		} );
	} );

	describe( 'currentGroupName()', () => {
		it( 'returns the #value of #groupDropdownView', () => {
			view.groupDropdownView.isOpen = true;

			expect( view.currentGroupName ).to.equal( 'groupA' );

			view.groupDropdownView.listView.items.last.children.first.fire( 'execute' );
			expect( view.currentGroupName ).to.equal( 'groupB' );
		} );
	} );

	describe( '#groupDropdownView', () => {
		let groupDropdownView;

		beforeEach( () => {
			groupDropdownView = view.groupDropdownView;
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

			view = new SpecialCharactersNavigationView( locale, new Map( [
				[ 'groupA', 'labelA' ],
				[ 'groupB', 'labelB' ]
			] ) );
			view.render();

			expect( view.groupDropdownView.panelPosition ).to.equal( 'se' );

			view.destroy();
		} );

		it( 'delegates #execute to the naviation view', () => {
			const spy = sinon.spy();

			view.on( 'execute', spy );

			groupDropdownView.fire( 'execute' );
			sinon.assert.calledOnce( spy );
		} );

		describe( 'buttonView', () => {
			it( 'binds #label to translation #value', () => {
				expect( groupDropdownView.buttonView.label ).to.equal( 'labelA' );

				groupDropdownView.listView.items.last.children.first.fire( 'execute' );
				expect( groupDropdownView.buttonView.label ).to.equal( 'labelB' );
			} );

			it( 'should be configured by the #groupDropdownView', () => {
				expect( groupDropdownView.buttonView.isOn ).to.be.true;
				expect( groupDropdownView.buttonView.withText ).to.be.true;
				expect( groupDropdownView.buttonView.tooltip ).to.equal( 'Character categories' );
				expect( groupDropdownView.buttonView.ariaLabel ).to.equal( 'Character categories' );
				expect( groupDropdownView.buttonView.ariaLabelledBy ).to.be.undefined;
			} );

			it( 'should have class "ck-dropdown__button_label-width_auto"', () => {
				const element = groupDropdownView.buttonView.element;

				expect( element.classList.contains( 'ck-dropdown__button_label-width_auto' ) ).to.be.true;
			} );
		} );

		describe( 'character group list', () => {
			it( 'should have properties set', () => {
				const listView = groupDropdownView.listView;

				expect( listView.element.role ).to.equal( 'menu' );
				expect( listView.element.ariaLabel ).to.equal( 'Character categories' );
			} );
		} );

		describe( 'character group list items', () => {
			it( 'have basic properties', () => {
				expect( groupDropdownView.listView.items
					.map( item => {
						const { name, label, withText } = item.children.first;

						return { name, label, withText };
					} ) )
					.to.deep.equal( [
						{ name: 'groupA', label: 'labelA', withText: true },
						{ name: 'groupB', label: 'labelB', withText: true }
					] );
			} );

			it( 'bind #isOn to the #value of the dropdown', () => {
				const firstButton = groupDropdownView.listView.items.first.children.last;
				const lastButton = groupDropdownView.listView.items.last.children.last;

				expect( firstButton.isOn ).to.be.true;
				expect( lastButton.isOn ).to.be.false;

				groupDropdownView.value = 'groupB';
				expect( firstButton.isOn ).to.be.false;
				expect( lastButton.isOn ).to.be.true;
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the character categories dropdown', () => {
			const spy = sinon.spy( view.groupDropdownView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
