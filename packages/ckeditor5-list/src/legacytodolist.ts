/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/legacytodolist
 */

import LegacyTodoListEditing from './legacytodolist/legacytodolistediting.js';
import TodoListUI from './todolist/todolistui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import '../theme/todolist.css';

/**
 * The legacy to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/legacytodolist/legacytodolistediting~LegacyTodoListEditing legacy to-do list
 * editing feature} and the {@link module:list/todolist/todolistui~TodoListUI to-do list UI feature}.
 */
export default class LegacyTodoList extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LegacyTodoListEditing, TodoListUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LegacyTodoList' as const;
	}
}
