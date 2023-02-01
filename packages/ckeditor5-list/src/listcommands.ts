/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listcommands
 */

import type DocumentListCommand from './documentlist/documentlistcommand';
import type DocumentListIndentCommand from './documentlist/documentlistindentcommand';
import type DocumentListMergeCommand from './documentlist/documentlistmergecommand';
import type DocumentListSplitCommand from './documentlist/documentlistsplitcommand';
import type DocumentListReversedCommand from './documentlistproperties/documentlistreversedcommand';
import type DocumentListStartCommand from './documentlistproperties/documentliststartcommand';
import type DocumentListStyleCommand from './documentlistproperties/documentliststylecommand';
import type IndentCommand from './list/indentcommand';
import type ListCommand from './list/listcommand';
import type ListReversedCommand from './listproperties/listreversedcommand';
import type ListStartCommand from './listproperties/liststartcommand';
import type ListStyleCommand from './listproperties/liststylecommand';
import type CheckTodoListCommand from './todolist/checktodolistcommand';

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		numberedList: ListCommand | DocumentListCommand;
		bulletedList: ListCommand | DocumentListCommand;
		indentList: IndentCommand | DocumentListIndentCommand;
		outdentList: IndentCommand | DocumentListIndentCommand;
		mergeListItemBackward: DocumentListMergeCommand;
		mergeListItemForward: DocumentListMergeCommand;
		splitListItemBefore: DocumentListSplitCommand;
		splitListItemAfter: DocumentListSplitCommand;
		listStyle: ListStyleCommand | DocumentListStyleCommand;
		listStart: ListStartCommand | DocumentListStartCommand;
		listReversed: ListReversedCommand | DocumentListReversedCommand;
		todoList: ListCommand;
		checkTodoList: CheckTodoListCommand;
	}
}
