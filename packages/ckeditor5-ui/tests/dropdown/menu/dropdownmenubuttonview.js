/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import { createMockLocale } from './_utils/dropdowntreemock.js';

import { IconView, ListItemButtonView } from '../../../src/index.js';
import DropdownMenuButtonView from '../../../src/dropdown/menu/dropdownmenubuttonview.js';

describe( 'DropdownMenuButtonView', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = createMockLocale();
		buttonView = new DropdownMenuButtonView( locale );
	} );

	afterEach( () => {
		buttonView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( buttonView ).to.be.instanceOf( ListItemButtonView );
		} );

		it( 'should set #withText', () => {
			expect( buttonView.withText ).to.be.true;
		} );

		it( 'should set #role', () => {
			expect( buttonView.role ).to.equal( 'menuitem' );
		} );

		describe( '#arrowView', () => {
			it( 'should inherit from IconView', () => {
				expect( buttonView.arrowView ).to.be.instanceOf( IconView );
			} );

			it( 'should have a specific CSS class', () => {
				expect( buttonView.arrowView.template.attributes.class ).to.include.members(
					[ 'ck-dropdown-menu-list__nested-menu__button__arrow' ]
				);
			} );

			it( 'should use a specific SVG icon', () => {
				expect( buttonView.arrowView.content ).to.equal( IconDropdownArrow );
			} );
		} );

		describe( 'DOM element and template', () => {
			it( 'should have a specific CSS class ', () => {
				expect( buttonView.template.attributes.class ).to.include.members( [ 'ck-dropdown-menu-list__nested-menu__button' ] );
			} );

			it( 'should have aria-haspopup attribute set', () => {
				expect( buttonView.template.attributes[ 'aria-haspopup' ] ).to.include.members( [ true ] );
			} );

			it( 'should have aria-expanded attribute bound to #isOn', () => {
				buttonView.render();

				expect( buttonView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'false' );

				buttonView.isOn = true;
				expect( buttonView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'true' );
			} );

			it( 'should have data-cke-tooltip-disabled attribute bound to #isOn', () => {
				buttonView.render();

				expect( buttonView.element.getAttribute( 'data-cke-tooltip-disabled' ) ).to.be.null;

				buttonView.isOn = true;
				expect( buttonView.element.getAttribute( 'data-cke-tooltip-disabled' ) ).to.equal( 'true' );
			} );

			it( 'should fire #mouseenter upon DOM mouseenter', () => {
				const spy = sinon.spy();

				buttonView.on( 'mouseenter', spy );
				buttonView.render();
				buttonView.element.dispatchEvent( new Event( 'mouseenter' ) );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add #arrowView to the children collection', () => {
			buttonView.render();

			expect( buttonView.children.has( buttonView.arrowView ) ).to.be.true;
		} );
	} );
} );
