/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list
 */

// List.
export { List } from './list.js';

export {
	ListEditing,
	type ListEditingPostFixerEvent,
	type ListType,
	type AttributeDowncastStrategy,
	type ItemMarkerDowncastStrategy,
	type DowncastStrategy
} from './list/listediting.js';

export { ListUtils } from './list/listutils.js';
export { ListUI } from './list/listui.js';
export { ListIndentCommand } from './list/listindentcommand.js';
export { ListCommand } from './list/listcommand.js';
export { ListMergeCommand } from './list/listmergecommand.js';
export { ListSplitCommand } from './list/listsplitcommand.js';

// Internal exports for 'list' submodule
export type {
	ListCommandAfterExecuteEvent as _ListCommandAfterExecuteEvent
} from './list/listcommand.js';

export type {
	ListItemAttributesMap as _ListItemAttributesMap,
	ListEditingCheckAttributesEvent as _ListEditingCheckAttributesEvent,
	ListEditingCheckElementEvent as _ListEditingCheckElementEvent
} from './list/listediting.js';

export type {
	ListIndentCommandAfterExecuteEvent as _ListIndentCommandAfterExecuteEvent
} from './list/listindentcommand.js';

export type {
	ListMergeCommandAfterExecuteEvent as _ListMergeCommandAfterExecuteEvent
} from './list/listmergecommand.js';

export type {
	ListSplitCommandAfterExecuteEvent as _ListSplitCommandAfterExecuteEvent
} from './list/listsplitcommand.js';

export {
	listItemUpcastConverter as _listItemUpcastConverter,
	reconvertItemsOnDataChange as _reconvertListItemsOnDataChange,
	listItemDowncastConverter as _listItemDowncastConverter,
	listItemDowncastRemoveConverter as _listItemDowncastRemoveConverter,
	bogusParagraphCreator as _listItemBogusParagraphCreator,
	findMappedViewElement as _findMappedListItemViewElement,
	createModelToViewPositionMapper as _createModelToViewListPositionMapper
} from './list/converters.js';

export { createUIComponents as _createListUIComponents } from './list/utils.js';
export {
	ListWalker as _ListWalker,
	SiblingListBlocksIterator as _SiblingListBlocksIterator,
	ListBlocksIterable as _ListBlocksIterable
} from './list/utils/listwalker.js';

export type {
	ListIteratorValue as _ListIteratorValue,
	ListWalkerOptions as _ListWalkerOptions
} from './list/utils/listwalker.js';

export {
	isListItemBlock as _isListItemBlock,
	getAllListItemBlocks as _getAllListItemBlocks,
	getListItemBlocks as _getListItemBlocks,
	getNestedListBlocks as _getNestedListBlocks,
	getListItems as _getListItems,
	isFirstBlockOfListItem as _isFirstBlockOfListItem,
	isLastBlockOfListItem as _isLastBlockOfListItem,
	expandListBlocksToCompleteItems as _expandListBlocksToCompleteItems,
	expandListBlocksToCompleteList as _expandListBlocksToCompleteList,
	splitListItemBefore as _splitListItemBefore,
	mergeListItemBefore as _mergeListItemBefore,
	indentBlocks as _indentListBlocks,
	outdentBlocksWithMerge as _outdentListBlocksWithMerge,
	removeListAttributes as _removeListAttributes,
	isSingleListItem as _isSingleListItem,
	outdentFollowingItems as _outdentFollowingListItems,
	sortBlocks as _sortListBlocks,
	getSelectedBlockObject as _getSelectedBlockObject,
	canBecomeSimpleListItem as _canBecomeSimpleListItem,
	isNumberedListType as _isNumberedListType
} from './list/utils/model.js';

export type {
	ListItemUid as _ListItemUid,
	ListElement as _ListElement
} from './list/utils/model.js';

export {
	findAndAddListHeadToMap as _findAndAddListHeadToMap,
	fixListIndents as _fixListIndents,
	fixListItemIds as _fixListItemIds
} from './list/utils/postfixers.js';

export {
	isListView as _isListView,
	isListItemView as _isListItemView,
	getIndent as _getListIndent,
	createListElement as _createListElement,
	createListItemElement as _createListItemElement,
	getViewElementNameForListType as _getViewElementNameForListType,
	getViewElementIdForListType as _getViewElementIdForListType
} from './list/utils/view.js';

// ListProperties.
export { ListProperties } from './listproperties.js';
export { ListPropertiesEditing } from './listproperties/listpropertiesediting.js';
export { ListPropertiesUtils } from './listproperties/listpropertiesutils.js';
export { ListPropertiesUI } from './listproperties/listpropertiesui.js';
export { ListReversedCommand } from './listproperties/listreversedcommand.js';
export { ListStartCommand } from './listproperties/liststartcommand.js';
export { ListStyleCommand } from './listproperties/liststylecommand.js';

// Internal exports for 'listproperties' submodule
export { listPropertiesUpcastConverter as _listPropertiesUpcastConverter } from './listproperties/converters.js';
export type { AttributeStrategy as _ListAttributeConversionStrategy } from './listproperties/listpropertiesediting.js';
export {
	ListPropertiesView as _ListPropertiesView,
	type ListPropertiesViewListStartEvent,
	type ListPropertiesViewListReversedEvent,
	type StylesView as _ListPropertiesStylesView
} from './listproperties/ui/listpropertiesview.js';

export { getNormalizedConfig as _getNormalizedListConfig } from './listproperties/utils/config.js';
export type { NormalizedListPropertiesConfig as _NormalizedListPropertiesConfig } from './listproperties/utils/config.js';
export {
	getAllSupportedStyleTypes as _getAllSupportedListStyleTypes,
	getListTypeFromListStyleType as _getListTypeFromListStyleType,
	getListStyleTypeFromTypeAttribute as _getListStyleTypeFromTypeAttribute,
	getTypeAttributeFromListStyleType as _getTypeAttributeFromListStyleType,
	normalizeListStyle as _normalizeListStyle
} from './listproperties/utils/style.js';

// TodoList/
export { TodoList } from './todolist.js';
export { TodoListUI } from './todolist/todolistui.js';
export { TodoListEditing } from './todolist/todolistediting.js';
export { CheckTodoListCommand } from './todolist/checktodolistcommand.js';
export type { ViewDocumentTodoCheckboxChangeEvent } from './todolist/todocheckboxchangeobserver.js';

// Internal exports for 'todolist' submodule
export { TodoCheckboxChangeObserver as _TodoCheckboxChangeObserver } from './todolist/todocheckboxchangeobserver.js';

// LegacyList.
export { LegacyList } from './legacylist.js';
export { LegacyListEditing } from './legacylist/legacylistediting.js';
export { LegacyListUtils } from './legacylist/legacylistutils.js';
export { LegacyIndentCommand } from './legacylist/legacyindentcommand.js';
export { LegacyListCommand } from './legacylist/legacylistcommand.js';

// LegacyListProperties.
export { LegacyListProperties } from './legacylistproperties.js';
export { LegacyListPropertiesEditing } from './legacylistproperties/legacylistpropertiesediting.js';
export { LegacyListReversedCommand } from './legacylistproperties/legacylistreversedcommand.js';
export { LegacyListStartCommand } from './legacylistproperties/legacyliststartcommand.js';
export { LegacyListStyleCommand } from './legacylistproperties/legacyliststylecommand.js';

// LegacyTodoList.
export { LegacyTodoList } from './legacytodolist.js';
export { LegacyTodoListEditing } from './legacytodolist/legacytodolistediting.js';
export { LegacyCheckTodoListCommand } from './legacytodolist/legacychecktodolistcommand.js';

// Other.
export type {
	ListConfig,
	ListPropertiesConfig,
	ListPropertiesStyleConfig,
	ListPropertiesStyleListType,
	ListStyleTypesConfig,
	NumberedListStyleType,
	BulletedListStyleType
} from './listconfig.js';

export { AdjacentListsSupport } from './list/adjacentlistssupport.js';

import './augmentation.js';
