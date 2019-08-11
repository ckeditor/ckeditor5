/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolist
 */

import TodoListEditing from './todolistediting';
import TodoListUI from './todolistui';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The todo list feature.
 *
 * This is a "glue" plugin which loads the {@link module:list/todolistediting~TodoListEditing todo list editing feature}
 * and {@link module:list/todolistui~TodoListUI list UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class List extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TodoListEditing, TodoListUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TodoList';
	}
}
