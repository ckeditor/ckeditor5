/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	ListItemView,
	DropdownMenuListItemView,
	DropdownMenuNestedMenuView
} from '../../../src/index.js';

describe( 'DropdownMenuListItemView', () => {
	let listItemView, parentMenuView, childMenu, element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );

		parentMenuView = new DropdownMenuNestedMenuView( editor.locale, editor.ui.view.body, 'parent', 'Parent' );
		childMenu = new DropdownMenuNestedMenuView( editor.locale, editor.ui.view.body, 'child', 'Child', parentMenuView );
		listItemView = new DropdownMenuListItemView( editor.locale, parentMenuView, childMenu );
	} );

	afterEach( async () => {
		listItemView.destroy();
		await editor.destroy();
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ListItemView', () => {
			expect( listItemView ).to.be.instanceOf( ListItemView );
		} );

		describe( 'template and DOM element', () => {
			it( 'should have a specific CSS class', () => {
				expect( listItemView.template.attributes.class ).to.include.members( [ 'ck-dropdown-menu-list__nested-menu__item' ] );
			} );

			it( 'should fire #mousenter upon DOM mousenter', () => {
				const spy = sinon.spy();

				listItemView.on( 'mouseenter', spy );
				listItemView.render();
				listItemView.element.dispatchEvent( new Event( 'mouseenter' ) );

				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should delegate events to a parent menu view', () => {
			const spy = sinon.spy();

			parentMenuView.on( 'mouseenter', spy );
			listItemView.render();
			listItemView.element.dispatchEvent( new Event( 'mouseenter' ) );

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
