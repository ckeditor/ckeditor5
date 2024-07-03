/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import {
	DropdownMenuListFilteredView,
	DropdownMenuListItemButtonView } from '../../../../src/index.js';

import { Dump, dumpDropdownMenuTree } from '../_utils/dropdowntreemenudump.js';
import { createMockMenuDefinition } from '../_utils/dropdowntreemock.js';
import { createRootTree } from '../_utils/dropdowntreeutils.js';

describe( 'DropdownMenuListFilteredView', () => {
	let locale, listView, editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
		locale = editor.locale;

		listView = createBlankMenuListFoundItemsView();
		listView.render();
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should create instance of DropdownMenuListFilteredView', () => {
			expect( listView ).to.be.instanceOf( DropdownMenuListFilteredView );
		} );

		it( 'should assign proper CSS classes', () => {
			expect( listView.template.attributes.class ).to.include.members( [ 'ck', 'ck-dropdown-menu-filter' ] );
		} );

		it( 'should create menu view instance', () => {
			expect( listView._menuView ).to.be.instanceOf( DropdownMenuRootListView );
		} );

		it( 'should not create found list view instance', () => {
			expect( listView._foundListView ).to.be.null;
		} );
	} );

	describe( 'focus()', () => {
		it( 'should call focus on menuView if there are no found items', () => {
			const menuViewFocusSpy = sinon.spy( listView._menuView, 'focus' );

			listView.focus();

			expect( menuViewFocusSpy ).to.be.calledOnce;
		} );

		it( 'should call focus on list view if there are found items', () => {
			appendMockedMenu();
			listView.filter( /Garlic/gi );

			const listViewFocusSpy = sinon.spy( listView._foundListView, 'focus' );

			listView.focus();

			expect( listViewFocusSpy ).to.be.calledOnce;
		} );
	} );

	describe( 'foundListView getter', () => {
		it( 'should be null initially', () => {
			expect( listView.foundListView ).to.be.null;
		} );

		it( 'should return found list view instance', () => {
			appendMockedMenu();
			listView.filter( /Garlic/gi );

			expect( listView.foundListView ).to.be.equal( listView._foundListView );
			expect( listView.foundListView ).not.to.be.null;
		} );
	} );

	describe( 'menuView getter', () => {
		it( 'should return menu view instance', () => {
			expect( listView.menuView ).to.be.equal( listView._menuView );
		} );

		it( 'should be possible to dump menu view using getter', () => {
			expect( dumpDropdownMenuTree( listView.menuView.tree ) ).to.be.equal( Dump.root() );
		} );

		it( 'should be possible to append new menu items to filter view', () => {
			appendMockedMenu();

			expect( dumpDropdownMenuTree( listView.menuView.tree ) ).to.be.equal(
				Dump.root( [
					Dump.menu( 'Menu 1', [
						Dump.item( 'Foo' ),
						Dump.item( 'Bar' ),
						Dump.item( 'Buz' )
					] ),
					Dump.item( 'Garlic' ),
					Dump.item( 'Bread' )
				] )
			);
		} );
	} );

	describe( 'filter()', () => {
		it( 'should filter items in menu view', () => {
			appendMockedMenu();

			assertSearchResult( {
				result: listView.filter( /Garlic/gi ),
				found: 1,
				total: 5,
				dump: Dump.root( [
					Dump.item( 'Garlic' )
				] )
			} );
		} );

		it( 'should filter items in menu view multiple times', () => {
			appendMockedMenu();

			assertSearchResult( {
				result: listView.filter( /Garlic/gi ),
				found: 1,
				total: 5,
				dump: Dump.root( [
					Dump.item( 'Garlic' )
				] )
			} );

			assertSearchResult( {
				result: listView.filter( /Menu 1/gi ),
				found: 3,
				total: 5,
				dump: Dump.root( [
					Dump.menu( 'Menu 1', [
						Dump.item( 'Foo' ),
						Dump.item( 'Bar' ),
						Dump.item( 'Buz' )
					] )
				] )
			} );
		} );

		it( 'should reset view if all matched', () => {
			appendMockedMenu();

			listView.filter( /Garlic/gi );

			expect( listView._menuView.element.parentNode ).to.be.null;
			expect( listView._foundListView.element ).not.to.be.null;

			listView.filter( /.+/gi );

			expect( listView._foundListView ).to.be.null;
			expect( listView._menuView.element.parentNode ).not.to.be.null;
		} );

		function assertSearchResult( { result, found, total, dump } ) {
			expect( result.resultsCount ).to.be.equal( found );
			expect( result.totalItemsCount ).to.be.equal( total );
			expect( dumpDropdownMenuTree( result.filteredTree ) ).to.be.equal( dump );
		}
	} );

	function createBlankMenuListFoundItemsView() {
		return new DropdownMenuListFilteredView( editor, createRootTree() );
	}

	function appendMockedMenu() {
		listView.menuView.factory.appendChildren(
			[
				createMockMenuDefinition(),
				new DropdownMenuListItemButtonView( locale, 'Garlic' ),
				new DropdownMenuListItemButtonView( locale, 'Bread' )
			]
		);
	}
} );
