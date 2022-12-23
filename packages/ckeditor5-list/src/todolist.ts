/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolist
 */

import TodoListEditing from './todolist/todolistediting';
import TodoListUI from './todolist/todolistui';
import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import '../theme/todolist.css';

/**
 * The to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/todolist/todolistediting~TodoListEditing to-do list editing feature}
 * and the {@link module:list/todolist/todolistui~TodoListUI to-do list UI feature}.
 */
export default class TodoList extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ TodoListEditing, TodoListUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TodoList' {
		return 'TodoList';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ TodoList.pluginName ]: TodoList;
	}
}
