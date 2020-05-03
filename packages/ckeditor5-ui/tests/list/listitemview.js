/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ButtonView from '../../src/button/buttonview';
import ListItemView from '../../src/list/listitemview';
import ViewCollection from '../../src/viewcollection';

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
		} );

		it( 'creates view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
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
	} );
} );
