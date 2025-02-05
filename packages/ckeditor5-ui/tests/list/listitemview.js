/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ButtonView from '../../src/button/buttonview.js';
import ListItemView from '../../src/list/listitemview.js';
import ViewCollection from '../../src/viewcollection.js';

describe( 'ListItemView', () => {
	let view;

	beforeEach( () => {
		view = new ListItemView();

		return view.render();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-list__item' ) ).to.be.true;
			expect( view.element.role ).to.equal( 'presentation' );
		} );

		it( 'creates view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'sets the #isVisible property', () => {
			expect( view.isVisible ).to.be.true;
		} );

		describe( 'DOM element bindings', () => {
			describe( 'class', () => {
				it( 'reacts on view#isVisible', () => {
					view.isVisible = true;
					expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

					view.isVisible = false;
					expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first child item', () => {
			const button = new ButtonView();
			view.children.add( button );

			const spy = sinon.spy( button.element, 'focus' );

			view.focus();
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not throw if there is no child view', () => {
			expect( () => {
				view.focus();
			} ).to.not.throw();
		} );
	} );
} );
