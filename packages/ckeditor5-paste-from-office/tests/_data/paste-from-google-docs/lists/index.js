/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import nestedOrderedList from './nested-ordered-lists/input.html';
import nestedOrderedListModel from './nested-ordered-lists/model.html';

import mixedList from './mixed-list/input.html';
import mixedListModel from './mixed-list/model.html';

import repeatedlyNestedList from './repeatedly-nested-list/input.html';
import repeatedlyNestedListModel from './repeatedly-nested-list/model.html';

import partiallySelected from './partially-selected/input.html';
import partiallySelectedModel from './partially-selected/model.html';

export const fixtures = {
	input: {
		nestedOrderedList,
		mixedList,
		repeatedlyNestedList,
		partiallySelected
	},
	model: {
		nestedOrderedList: nestedOrderedListModel,
		mixedList: mixedListModel,
		repeatedlyNestedList: repeatedlyNestedListModel,
		partiallySelected: partiallySelectedModel
	}
};

export const browserFixtures = {};
