/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	DocumentList,
	DocumentListEditing,
	DocumentListProperties,
	DocumentListPropertiesEditing,
	DocumentListPropertiesUtils,
	AdjacentListsSupport,
	DocumentListUtils,
	ListConfig,
	LegacyList,
	LegacyListEditing,
	LegacyListProperties,
	LegacyListPropertiesEditing,
	ListPropertiesUI,
	ListUI,
	LegacyListUtils,
	LegacyTodoList,
	LegacyTodoListEditing,
	TodoListUI,
	TodoDocumentList,
	TodoDocumentListEditing,

	LegacyListCommand,
	DocumentListCommand,
	LegacyIndentCommand,
	DocumentListIndentCommand,
	DocumentListMergeCommand,
	DocumentListSplitCommand,
	LegacyListStyleCommand,
	DocumentListStyleCommand,
	LegacyListStartCommand,
	DocumentListStartCommand,
	LegacyListReversedCommand,
	DocumentListReversedCommand,
	LegacyCheckTodoListCommand,
	CheckTodoDocumentListCommand
} from '.';

declare module '@ckeditor/ckeditor5-core' {
  interface EditorConfig {

		/**
		 * The configuration of the {@link module:list/list~List} feature and the {@link module:list/documentlist~DocumentList} feature.
		 *
		 * Read more in {@link module:list/listconfig~ListConfig}.
		 */
		list?: ListConfig;
	}

	interface PluginsMap {
		[ DocumentList.pluginName ]: DocumentList;
		[ DocumentListEditing.pluginName ]: DocumentListEditing;
		[ DocumentListProperties.pluginName ]: DocumentListProperties;
		[ DocumentListPropertiesEditing.pluginName ]: DocumentListPropertiesEditing;
		[ DocumentListPropertiesUtils.pluginName ]: DocumentListPropertiesUtils;
		[ DocumentListUtils.pluginName ]: DocumentListUtils;
		[ AdjacentListsSupport.pluginName ]: AdjacentListsSupport;
		[ LegacyList.pluginName ]: LegacyList;
		[ LegacyListEditing.pluginName ]: LegacyListEditing;
		[ LegacyListProperties.pluginName ]: LegacyListProperties;
		[ LegacyListPropertiesEditing.pluginName ]: LegacyListPropertiesEditing;
		[ ListPropertiesUI.pluginName ]: ListPropertiesUI;
		[ ListUI.pluginName ]: ListUI;
		[ LegacyListUtils.pluginName ]: LegacyListUtils;
		[ LegacyTodoList.pluginName ]: LegacyTodoList;
		[ LegacyTodoListEditing.pluginName ]: LegacyTodoListEditing;
		[ TodoListUI.pluginName ]: TodoListUI;
		[ TodoDocumentList.pluginName ]: TodoDocumentList;
		[ TodoDocumentListEditing.pluginName ]: TodoDocumentListEditing;
	}

  interface CommandsMap {
		numberedList: LegacyListCommand | DocumentListCommand;
		bulletedList: LegacyListCommand | DocumentListCommand;
		indentList: LegacyIndentCommand | DocumentListIndentCommand;
		outdentList: LegacyIndentCommand | DocumentListIndentCommand;
		mergeListItemBackward: DocumentListMergeCommand;
		mergeListItemForward: DocumentListMergeCommand;
		splitListItemBefore: DocumentListSplitCommand;
		splitListItemAfter: DocumentListSplitCommand;
		listStyle: LegacyListStyleCommand | DocumentListStyleCommand;
		listStart: LegacyListStartCommand | DocumentListStartCommand;
		listReversed: LegacyListReversedCommand | DocumentListReversedCommand;
		todoList: LegacyListCommand | DocumentListCommand;
		checkTodoList: LegacyCheckTodoListCommand | CheckTodoDocumentListCommand;
	}
}
