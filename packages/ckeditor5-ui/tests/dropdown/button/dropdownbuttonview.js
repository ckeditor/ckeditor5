/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import IconView from '../../../src/icon/iconview';
import DropdownButtonView from '../../../src/dropdown/button/dropdownbuttonview';

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
	} );
} );
