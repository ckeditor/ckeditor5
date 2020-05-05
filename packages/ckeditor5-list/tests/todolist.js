/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoList from '../src/todolist';
import TodoListEditing from '../src/todolistediting';
import TodoListUI from '../src/todolistui';

describe( 'TodoList', () => {
	it( 'should be named', () => {
		expect( TodoList.pluginName ).to.equal( 'TodoList' );
	} );

	it( 'should require TodoListEditing and TodoListUI', () => {
		expect( TodoList.requires ).to.deep.equal( [ TodoListEditing, TodoListUI ] );
	} );
} );
