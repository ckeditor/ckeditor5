/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolist/todolistui
 */

import { createUIComponents } from '../list/utils.js';
import { icons, Plugin } from 'ckeditor5/src/core.js';

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
	public init(): void {
		const t = this.editor.t;

		createUIComponents( this.editor, 'todoList', t( 'To-do List' ), icons.todoList );
	}
}
