/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import nestedOrderedList from './nested-ordered-lists/input.html?raw';
import nestedOrderedListModel from './nested-ordered-lists/model.html?raw';

import mixedList from './mixed-list/input.html?raw';
import mixedListModel from './mixed-list/model.html?raw';

import repeatedlyNestedList from './repeatedly-nested-list/input.html?raw';
import repeatedlyNestedListModel from './repeatedly-nested-list/model.html?raw';

import partiallySelected from './partially-selected/input.html?raw';
import partiallySelectedModel from './partially-selected/model.html?raw';

import emptyListItem from './empty-list-item/input.html?raw';
import emptyListItemModel from './empty-list-item/model.html?raw';

export const fixtures = {
	input: {
		nestedOrderedList,
		mixedList,
		repeatedlyNestedList,
		partiallySelected,
		emptyListItem
	},
	model: {
		nestedOrderedList: nestedOrderedListModel,
		mixedList: mixedListModel,
		repeatedlyNestedList: repeatedlyNestedListModel,
		partiallySelected: partiallySelectedModel,
		emptyListItem: emptyListItemModel
	}
};

export const browserFixtures = {};
