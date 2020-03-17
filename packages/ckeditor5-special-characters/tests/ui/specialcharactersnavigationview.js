/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpecialCharactersNavigationView from '../../src/ui/specialcharactersnavigationview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

describe( 'SpecialCharactersNavigationView', () => {
	let view, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		view = new SpecialCharactersNavigationView( locale, [ 'groupA', 'groupB' ] );
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

		it( 'should contain following instances as children: LabelView, Dropdown', () => {
			expect( view.children.first ).to.be.instanceOf( LabelView );
			expect( view.children.last ).to.be.instanceOf( DropdownView );
		} );
	} );

	describe( 'currentGroupName()', () => {
		it( 'returns the #value of #groupDropdownView', () => {
			expect( view.currentGroupName ).to.equal( 'groupA' );

			view.groupDropdownView.listView.items.last.children.first.fire( 'execute' );
			expect( view.currentGroupName ).to.equal( 'groupB' );
		} );
	} );

	describe( '#groupDropdownView', () => {
		let groupDropdownView;

		beforeEach( () => {
			groupDropdownView = view.groupDropdownView;
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

			view = new SpecialCharactersNavigationView( locale, [ 'groupA', 'groupB' ] );
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
			it( 'binds #label to #value', () => {
				expect( groupDropdownView.buttonView.label ).to.equal( 'groupA' );

				groupDropdownView.listView.items.last.children.first.fire( 'execute' );
				expect( groupDropdownView.buttonView.label ).to.equal( 'groupB' );
			} );

			it( 'should be configured by the #groupDropdownView', () => {
				expect( groupDropdownView.buttonView.isOn ).to.be.false;
				expect( groupDropdownView.buttonView.withText ).to.be.true;
				expect( groupDropdownView.buttonView.tooltip ).to.equal( 'Character categories' );
			} );

			it( 'should have class "ck-dropdown__button_label-width_auto"', () => {
				const element = groupDropdownView.buttonView.element;

				expect( element.classList.contains( 'ck-dropdown__button_label-width_auto' ) ).to.be.true;
			} );
		} );

		describe( 'character group list items', () => {
			it( 'have basic properties', () => {
				expect( groupDropdownView.listView.items
					.map( item => {
						const { label, withText } = item.children.first;

						return { label, withText };
					} ) )
					.to.deep.equal( [
						{ label: 'groupA', withText: true },
						{ label: 'groupB', withText: true }
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
} );
