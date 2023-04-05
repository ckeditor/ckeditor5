/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolist/todolistui
 */

import { createUIComponent } from '../list/utils';
import todoListIcon from '../../theme/icons/todolist.svg';
import { Plugin } from 'ckeditor5/src/core';

/**
 * The to-do list UI feature. It introduces the `'todoList'` button that
 * allows to convert elements to and from to-do list items and to indent or outdent them.
 */
export default class TodoListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TodoListUI' {
		return 'TodoListUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const t = this.editor.t;

		createUIComponent( this.editor, 'todoList', t( 'To-do List' ), todoListIcon );
	}
}
