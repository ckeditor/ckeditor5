/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event, document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	ListItemView,
	DropdownMenuListItemView,
	DropdownMenuView
} from '../../../src/index.js';

describe( 'DropdownMenuListItemView', () => {
	let listItemView, parentMenuView, childMenu, element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );

		parentMenuView = new DropdownMenuView( editor );
		childMenu = new DropdownMenuView( editor );
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
				expect( listItemView.template.attributes.class ).to.include.members( [ 'ck-dropdown-menu__menu__item' ] );
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
