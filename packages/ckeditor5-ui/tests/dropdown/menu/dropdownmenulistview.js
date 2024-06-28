/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { DropdownMenuListDefinitionFactory } from '../../../src/dropdown/menu/definition/dropdownmenulistdefinitionfactory.js';
import { ListView, DropdownMenuListView, DropdownMenuView } from '../../../src/index.js';

import { createMockLocale, createMockMenuDefinition } from './_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToFlatMenuTreeItemByLabel,
	mapMenuViewToMenuTreeItemByLabel
} from './_utils/dropdowntreeutils.js';

describe( 'DropdownMenuListView', () => {
	let listView, locale, element, editor, factory;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );

		locale = createMockLocale();
		listView = new DropdownMenuListView( locale );
		factory = new DropdownMenuListDefinitionFactory( {
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

	describe( 'tree()', () => {
		it( 'should return tree of items', () => {
			factory.appendChildren( [ createMockMenuDefinition() ] );

			const { tree } = listView;

			expect( tree ).to.be.deep.equal(
				createRootTree( [
					mapMenuViewToMenuTreeItemByLabel(
						'Menu 1',
						tree,
						[
							mapButtonViewToFlatMenuTreeItemByLabel( 'Foo', tree ),
							mapButtonViewToFlatMenuTreeItemByLabel( 'Bar', tree ),
							mapButtonViewToFlatMenuTreeItemByLabel( 'Buz', tree )
						]
					)
				] )
			);
		} );
	} );
} );
