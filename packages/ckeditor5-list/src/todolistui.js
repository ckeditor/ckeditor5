/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistui
 */

import { createUIComponent } from './utils';
import todoListIcon from '../theme/icons/todolist.svg';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The to-do list UI feature. It introduces the `'todoList'` button that
 * allows to convert elements to and from to-do list items and to indent or outdent them.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TodoListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const t = this.editor.t;

		createUIComponent( this.editor, 'todoList', t( 'To-do List' ), todoListIcon );
	}
}
