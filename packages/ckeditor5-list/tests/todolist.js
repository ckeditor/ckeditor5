/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoList from '../src/todolist';
import TodoListEditing from '../src/todolist/todolistediting';
import TodoListUI from '../src/todolist/todolistui';

describe( 'TodoList', () => {
	it( 'should be named', () => {
		expect( TodoList.pluginName ).to.equal( 'TodoList' );
	} );

	it( 'should require TodoListEditing and TodoListUI', () => {
		expect( TodoList.requires ).to.deep.equal( [ TodoListEditing, TodoListUI ] );
	} );
} );
