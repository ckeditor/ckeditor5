/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoList from '../src/todolist.js';
import TodoListEditing from '../src/todolist/todolistediting.js';
import TodoListUI from '../src/todolist/todolistui.js';

describe( 'TodoList', () => {
	it( 'should be named', () => {
		expect( TodoList.pluginName ).to.equal( 'TodoList' );
	} );

	it( 'should require TodoListEditing and TodoListUI', () => {
		expect( TodoList.requires ).to.deep.equal( [ TodoListEditing, TodoListUI ] );
	} );
} );
