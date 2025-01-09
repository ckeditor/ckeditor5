/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import IconView from '../../../src/icon/iconview.js';
import DropdownButtonView from '../../../src/dropdown/button/dropdownbuttonview.js';

describe( 'DropdownButtonView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t() {} };

		view = new DropdownButtonView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'creates view#arrowView', () => {
			expect( view.arrowView ).to.be.instanceOf( IconView );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'BUTTON' );
			expect( view.element.attributes[ 'aria-haspopup' ].value ).to.equal( 'true' );
		} );
	} );

	describe( 'bindings', () => {
		it( 'delegates view#execute to view#open', () => {
			const spy = sinon.spy();

			view.on( 'open', spy );

			view.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'binds button\'s aria-expanded attribute to #isOn', () => {
			view.isOn = true;
			expect( view.element.getAttribute( 'aria-expanded' ) ).to.equal( 'true' );

			view.isOn = false;
			expect( view.element.getAttribute( 'aria-expanded' ) ).to.equal( 'false' );
		} );
	} );
} );
