/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { DropdownMenuFactory } from '../../../src/dropdown/menu/dropdownmenufactory.js';
import { ListView, DropdownMenuListView, DropdownMenuView } from '../../../src/index.js';

import { createMockLocale } from './_utils/dropdowntreemock.js';

describe( 'DropdownMenuListView', () => {
	let listView, locale, element, editor, factory;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );

		locale = createMockLocale();
		listView = new DropdownMenuListView( locale );
		factory = new DropdownMenuFactory( {
			createMenuViewInstance: ( ...args ) => new DropdownMenuView( editor, ...args ),
			listView
		} );
	} );

	afterEach( async () => {
		listView.destroy();
		await editor.destroy();
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ListView', () => {
			expect( listView ).to.be.instanceOf( ListView );
		} );

		it( 'should have #role set', () => {
			expect( listView.role ).to.equal( 'menu' );
		} );
	} );
} );
