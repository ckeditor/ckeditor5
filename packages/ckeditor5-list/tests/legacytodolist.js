/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LegacyTodoList from '../src/legacytodolist.js';
import LegacyTodoListEditing from '../src/legacytodolist/legacytodolistediting.js';
import TodoListUI from '../src/todolist/todolistui.js';

describe( 'LegacyTodoList', () => {
	it( 'should be named', () => {
		expect( LegacyTodoList.pluginName ).to.equal( 'LegacyTodoList' );
	} );

	it( 'should require LegacyTodoListEditing and TodoListUI', () => {
		expect( LegacyTodoList.requires ).to.deep.equal( [ LegacyTodoListEditing, TodoListUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyTodoList.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyTodoList.isPremiumPlugin ).to.be.false;
	} );
} );
