/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	List,
	ListEditing,
	ListUtils,
	ListUI,
	ListCommand,
	ListIndentCommand,
	ListMergeCommand,
	ListSplitCommand,

	ListProperties,
	ListPropertiesUtils,
	ListPropertiesEditing,
	ListPropertiesUI,
	ListStyleCommand,
	ListStartCommand,
	ListReversedCommand,

	TodoList,
	TodoListEditing,
	TodoListUI,
	CheckTodoListCommand,

	LegacyList,
	LegacyListEditing,
	LegacyListUtils,
	LegacyListCommand,
	LegacyIndentCommand,

	LegacyListProperties,
	LegacyListPropertiesEditing,
	LegacyListStyleCommand,
	LegacyListStartCommand,
	LegacyListReversedCommand,

	LegacyTodoList,
	LegacyTodoListEditing,
	LegacyCheckTodoListCommand,

	ListConfig
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:list/list~List} feature and the {@link module:list/legacylist~LegacyList} feature.
		 *
		 * Read more in {@link module:list/listconfig~ListConfig}.
		 */
		list?: ListConfig;
	}

	interface PluginsMap {
		[ List.pluginName ]: List;
		[ ListEditing.pluginName ]: ListEditing;
		[ ListUtils.pluginName ]: ListUtils;
		[ ListUI.pluginName ]: ListUI;
		[ ListProperties.pluginName ]: ListProperties;
		[ ListPropertiesEditing.pluginName ]: ListPropertiesEditing;
		[ ListPropertiesUtils.pluginName ]: ListPropertiesUtils;
		[ ListPropertiesUI.pluginName ]: ListPropertiesUI;
		[ TodoList.pluginName ]: TodoList;
		[ TodoListEditing.pluginName ]: TodoListEditing;
		[ TodoListUI.pluginName ]: TodoListUI;

		[ LegacyList.pluginName ]: LegacyList;
		[ LegacyListEditing.pluginName ]: LegacyListEditing;
		[ LegacyListUtils.pluginName ]: LegacyListUtils;
		[ LegacyListProperties.pluginName ]: LegacyListProperties;
		[ LegacyListPropertiesEditing.pluginName ]: LegacyListPropertiesEditing;
		[ LegacyTodoList.pluginName ]: LegacyTodoList;
		[ LegacyTodoListEditing.pluginName ]: LegacyTodoListEditing;
	}

	interface CommandsMap {
		numberedList: LegacyListCommand | ListCommand;
		bulletedList: LegacyListCommand | ListCommand;
		indentList: LegacyIndentCommand | ListIndentCommand;
		outdentList: LegacyIndentCommand | ListIndentCommand;
		mergeListItemBackward: ListMergeCommand;
		mergeListItemForward: ListMergeCommand;
		splitListItemBefore: ListSplitCommand;
		splitListItemAfter: ListSplitCommand;
		listStyle: LegacyListStyleCommand | ListStyleCommand;
		listStart: LegacyListStartCommand | ListStartCommand;
		listReversed: LegacyListReversedCommand | ListReversedCommand;
		todoList: LegacyListCommand | ListCommand;
		checkTodoList: LegacyCheckTodoListCommand | CheckTodoListCommand;
	}
}
