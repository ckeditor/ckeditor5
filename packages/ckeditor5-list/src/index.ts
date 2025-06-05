/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list
 */

// List.
export { List } from './list.js';
export { ListEditing, type ListEditingPostFixerEvent, type ListType } from './list/listediting.js';
export { ListUtils } from './list/listutils.js';
export { ListUI } from './list/listui.js';
export { ListIndentCommand } from './list/listindentcommand.js';
export { ListCommand } from './list/listcommand.js';
export type { ListMergeCommand } from './list/listmergecommand.js';
export type { ListSplitCommand } from './list/listsplitcommand.js';

// ListProperties.
export { ListProperties } from './listproperties.js';
export { ListPropertiesEditing } from './listproperties/listpropertiesediting.js';
export { ListPropertiesUtils } from './listproperties/listpropertiesutils.js';
export { ListPropertiesUI } from './listproperties/listpropertiesui.js';
export type { ListReversedCommand } from './listproperties/listreversedcommand.js';
export type { ListStartCommand } from './listproperties/liststartcommand.js';
export type { ListStyleCommand } from './listproperties/liststylecommand.js';

// TodoList/
export { TodoList } from './todolist.js';
export { TodoListUI } from './todolist/todolistui.js';
export { TodoListEditing } from './todolist/todolistediting.js';
export type { CheckTodoListCommand } from './todolist/checktodolistcommand.js';

// LegacyList.
export { LegacyList } from './legacylist.js';
export { LegacyListEditing } from './legacylist/legacylistediting.js';
export { LegacyListUtils } from './legacylist/legacylistutils.js';
export { LegacyIndentCommand } from './legacylist/legacyindentcommand.js';
export type { LegacyListCommand } from './legacylist/legacylistcommand.js';

// LegacyListProperties.
export { LegacyListProperties } from './legacylistproperties.js';
export { LegacyListPropertiesEditing } from './legacylistproperties/legacylistpropertiesediting.js';
export type { LegacyListReversedCommand } from './legacylistproperties/legacylistreversedcommand.js';
export type { LegacyListStartCommand } from './legacylistproperties/legacyliststartcommand.js';
export type { LegacyListStyleCommand } from './legacylistproperties/legacyliststylecommand.js';

// LegacyTodoList.
export { LegacyTodoList } from './legacytodolist.js';
export { LegacyTodoListEditing } from './legacytodolist/legacytodolistediting.js';
export type { LegacyCheckTodoListCommand } from './legacytodolist/legacychecktodolistcommand.js';

// Other.
export type { ListConfig, ListPropertiesConfig } from './listconfig.js';
export { AdjacentListsSupport } from './list/adjacentlistssupport.js';

import './augmentation.js';
