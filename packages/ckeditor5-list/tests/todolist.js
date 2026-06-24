/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { TodoList } from '../src/todolist.js';
import { TodoListEditing } from '../src/todolist/todolistediting.js';
import { TodoListUI } from '../src/todolist/todolistui.js';

describe( 'TodoList', () => {
	it( 'should be named', () => {
		expect( TodoList.pluginName ).toBe( 'TodoList' );
	} );

	it( 'should require TodoListEditing and TodoListUI', () => {
		expect( TodoList.requires ).toEqual( [ TodoListEditing, TodoListUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TodoList.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TodoList.isPremiumPlugin ).toBe( false );
	} );
} );
