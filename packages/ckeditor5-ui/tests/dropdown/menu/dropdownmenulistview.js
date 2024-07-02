/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { DropdownMenuFactory } from '../../../src/dropdown/menu/dropdownmenufactory.js';
import { ListView, DropdownMenuListView, DropdownMenuView, ListItemView, DropdownMenuListItemButtonView } from '../../../src/index.js';

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

		it( 'should have #isFocusBorderEnabled set to false', () => {
			expect( listView.isFocusBorderEnabled ).to.be.false;
		} );

		it( 'should bind #isFocusBorderEnabled to proper class name', () => {
			listView.render();

			listView.isFocusBorderEnabled = true;
			expect( listView.element.classList.contains( 'ck-dropdown-menu_focus-border-enabled' ) ).to.be.true;

			listView.isFocusBorderEnabled = false;
			expect( listView.element.classList.contains( 'ck-dropdown-menu_focus-border-enabled' ) ).to.be.false;
		} );
	} );

	describe( 'hasCheckSpace', () => {
		it( 'should assign icon space if appended toggleable item', () => {
			factory.appendChildren( [
				new DropdownMenuListItemButtonView( locale, 'Foo' ),
				new DropdownMenuListItemButtonView( locale, 'Bar' )
			] );

			expect( listView.items ).to.have.length( 2 );
			expect( [ ...listView.items ].some( item => item.childView.hasCheckSpace ) ).to.be.false;

			const toggleableButton = new DropdownMenuListItemButtonView( locale, 'Buz' );

			toggleableButton.isToggleable = true;
			factory.appendChildren( [
				toggleableButton
			] );

			expect( listView.items ).to.have.length( 3 );
			expect( [ ...listView.items ].every( item => item.childView.hasCheckSpace ) ).to.be.true;
		} );
	} );

	describe( 'scrolling', () => {
		beforeEach( () => {
			listView.render();
			document.body.append( listView.element );
		} );

		afterEach( () => {
			listView.element.remove();
		} );

		it( 'should have #_isScrollable set to false', () => {
			expect( listView._isScrollable ).to.be.false;
		} );

		it( 'should bind #_isScrollable to proper class name', () => {
			listView._isScrollable = true;
			expect( listView.element.classList.contains( 'ck-dropdown-menu_scrollable' ) ).to.be.true;

			listView._isScrollable = false;
			expect( listView.element.classList.contains( 'ck-dropdown-menu_scrollable' ) ).to.be.false;
		} );

		it( 'should check if scrollable after render', () => {
			listView.element.remove();
			listView = new DropdownMenuListView( locale );

			const checkIfScrollableSpy = sinon.spy( listView, 'checkIfScrollable' );

			expect( checkIfScrollableSpy ).not.to.be.called;
			listView.render();
			expect( checkIfScrollableSpy ).to.be.calledOnce;
		} );

		it( 'should set _isScrollable to true if scrollHeight is greater than clientHeight', () => {
			listView.element.style.height = '9999px';
			listView.checkIfScrollable();
			expect( listView._isScrollable ).to.be.true;

			listView.element.style.height = '9px';
			listView.checkIfScrollable();
			expect( listView._isScrollable ).to.be.false;
		} );

		it( 'should call checkIfScrollable on resize event', () => {
			const checkIfScrollableSpy = sinon.spy( listView, 'checkIfScrollable' );

			global.window.dispatchEvent( new Event( 'resize' ) );

			expect( checkIfScrollableSpy ).to.be.calledOnce;
		} );

		it( 'should call checkIfScrollable on items list change', () => {
			const checkIfScrollableSpy = sinon.spy( listView, 'checkIfScrollable' );

			listView.items.add( new ListItemView() );

			expect( checkIfScrollableSpy ).to.be.calledOnce;

			listView.items.remove( listView.items.get( 0 ) );

			expect( checkIfScrollableSpy ).to.be.calledTwice;
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
