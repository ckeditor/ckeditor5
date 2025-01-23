/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/todolist/todolistui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconTodoList } from 'ckeditor5/src/icons.js';
import { registerIcon } from 'ckeditor5/src/utils.js';
import { createUIComponents } from '../list/utils.js';

const todoListIcon = /* #__PURE__ */ registerIcon( '--ck-icon-todo-list', IconTodoList );

/**
 * The to-do list UI feature. It introduces the `'todoList'` button that
 * allows to convert elements to and from to-do list items and to indent or outdent them.
 */
export default class TodoListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TodoListUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const t = this.editor.t;

		createUIComponents( this.editor, 'todoList', t( 'To-do List' ), todoListIcon );
	}
}
