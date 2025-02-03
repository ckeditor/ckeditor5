/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SearchInfoView from '../../src/search/searchinfoview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'SearchInfoView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new SearchInfoView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates and element from template with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-search__info' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
		} );

		it( 'sets #isVisible and creates a DOM binding', () => {
			expect( view.isVisible ).to.be.false;

			view.isVisible = true;

			expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;
		} );

		it( 'sets #primaryText and creates a DOM binding', () => {
			expect( view.primaryText ).to.equal( '' );

			view.primaryText = 'foo';

			expect( view.element.innerHTML ).to.equal( '<span>foo</span><span></span>' );
		} );

		it( 'sets #secondaryText', () => {
			expect( view.secondaryText ).to.equal( '' );

			view.secondaryText = 'bar';

			expect( view.element.innerHTML ).to.equal( '<span></span><span>bar</span>' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus #element', () => {
			const spy = sinon.spy( view.element, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
