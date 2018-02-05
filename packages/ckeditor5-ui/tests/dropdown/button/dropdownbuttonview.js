/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import IconView from '../../../src/icon/iconview';
import DropdownButtonView from '../../../src/dropdown/button/dropdownbuttonview';

testUtils.createSinonSandbox();

describe( 'DropdownButtonView', () => {
	let locale, view;

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
		} );
	} );

	describe( 'bindings', () => {
		it( 'delegates view#execute to view#select', () => {
			const spy = sinon.spy();

			view.on( 'select', spy );

			view.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
