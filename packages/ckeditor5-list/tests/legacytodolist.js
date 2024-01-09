/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
} );
