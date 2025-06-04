/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list
 */

// List.
export { default as List } from './list.js';
export { default as ListEditing, type ListEditingPostFixerEvent, type ListType } from './list/listediting.js';
export { default as ListUtils } from './list/listutils.js';
export { default as ListUI } from './list/listui.js';
export { default as ListIndentCommand } from './list/listindentcommand.js';
export { default as ListCommand } from './list/listcommand.js';
export type { default as ListMergeCommand } from './list/listmergecommand.js';
export type { default as ListSplitCommand } from './list/listsplitcommand.js';

// ListProperties.
export { default as ListProperties } from './listproperties.js';
export { default as ListPropertiesEditing } from './listproperties/listpropertiesediting.js';
export { default as ListPropertiesUtils } from './listproperties/listpropertiesutils.js';
export { default as ListPropertiesUI } from './listproperties/listpropertiesui.js';
export type { default as ListReversedCommand } from './listproperties/listreversedcommand.js';
export type { default as ListStartCommand } from './listproperties/liststartcommand.js';
export type { default as ListStyleCommand } from './listproperties/liststylecommand.js';

// TodoList/
export { default as TodoList } from './todolist.js';
export { default as TodoListUI } from './todolist/todolistui.js';
export { default as TodoListEditing } from './todolist/todolistediting.js';
export type { default as CheckTodoListCommand } from './todolist/checktodolistcommand.js';

// LegacyList.
export { default as LegacyList } from './legacylist.js';
export { default as LegacyListEditing } from './legacylist/legacylistediting.js';
export { default as LegacyListUtils } from './legacylist/legacylistutils.js';
export { default as LegacyIndentCommand } from './legacylist/legacyindentcommand.js';
export type { default as LegacyListCommand } from './legacylist/legacylistcommand.js';

// LegacyListProperties.
export { default as LegacyListProperties } from './legacylistproperties.js';
export { default as LegacyListPropertiesEditing } from './legacylistproperties/legacylistpropertiesediting.js';
export type { default as LegacyListReversedCommand } from './legacylistproperties/legacylistreversedcommand.js';
export type { default as LegacyListStartCommand } from './legacylistproperties/legacyliststartcommand.js';
export type { default as LegacyListStyleCommand } from './legacylistproperties/legacyliststylecommand.js';

// LegacyTodoList.
export { default as LegacyTodoList } from './legacytodolist.js';
export { default as LegacyTodoListEditing } from './legacytodolist/legacytodolistediting.js';
export type { default as LegacyCheckTodoListCommand } from './legacytodolist/legacychecktodolistcommand.js';

// Other.
export type { ListConfig, ListPropertiesConfig } from './listconfig.js';
export { default as AdjacentListsSupport } from './list/adjacentlistssupport.js';

import './augmentation.js';
