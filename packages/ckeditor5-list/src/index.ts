/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list
 */

export { default as DocumentList } from './documentlist.js';
export { default as DocumentListEditing, type DocumentListEditingPostFixerEvent } from './documentlist/documentlistediting.js';
export { default as DocumentListIndentCommand } from './documentlist/documentlistindentcommand.js';
export { default as AdjacentListsSupport } from './documentlist/adjacentlistssupport.js';
export { default as DocumentListProperties } from './documentlistproperties.js';
export { default as DocumentListPropertiesEditing } from './documentlistproperties/documentlistpropertiesediting.js';
export { default as DocumentListUtils } from './documentlist/documentlistutils.js';
export { default as DocumentListPropertiesUtils } from './documentlistproperties/documentlistpropertiesutils.js';
export { default as LegacyIndentCommand } from './legacylist/legacyindentcommand.js';
export { default as LegacyList } from './legacylist.js';
export { default as LegacyListEditing } from './legacylist/legacylistediting.js';
export { default as ListUI } from './list/listui.js';
export { default as LegacyListProperties } from './legacylistproperties.js';
export { default as LegacyListUtils } from './legacylist/legacylistutils.js';
export { default as LegacyListPropertiesEditing } from './legacylistproperties/legacylistpropertiesediting.js';
export { default as ListPropertiesUI } from './listproperties/listpropertiesui.js';
export { default as LegacyTodoList } from './legacytodolist.js';
export { default as LegacyTodoListEditing } from './legacytodolist/legacytodolistediting.js';
export { default as TodoListUI } from './todolist/todolistui.js';
export { default as TodoDocumentList } from './tododocumentlist.js';
export { default as TodoDocumentListEditing } from './tododocumentlist/tododocumentlistediting.js';

export type { ListConfig, ListPropertiesConfig } from './listconfig.js';
export type { default as DocumentListCommand } from './documentlist/documentlistcommand.js';
export type { default as DocumentListMergeCommand } from './documentlist/documentlistmergecommand.js';
export type { default as DocumentListSplitCommand } from './documentlist/documentlistsplitcommand.js';
export type { default as DocumentListReversedCommand } from './documentlistproperties/documentlistreversedcommand.js';
export type { default as DocumentListStartCommand } from './documentlistproperties/documentliststartcommand.js';
export type { default as DocumentListStyleCommand } from './documentlistproperties/documentliststylecommand.js';
export type { default as LegacyListCommand } from './legacylist/legacylistcommand.js';
export type { default as LegacyListReversedCommand } from './legacylistproperties/legacylistreversedcommand.js';
export type { default as LegacyListStartCommand } from './legacylistproperties/legacyliststartcommand.js';
export type { default as LegacyListStyleCommand } from './legacylistproperties/legacyliststylecommand.js';
export type { default as LegacyCheckTodoListCommand } from './legacytodolist/legacychecktodolistcommand.js';
export type { default as CheckTodoDocumentListCommand } from './tododocumentlist/checktododocumentlistcommand.js';

import './augmentation.js';

// TODO temporary
export { default as List } from './legacylist.js';
export { default as ListProperties } from './legacylistproperties.js';
