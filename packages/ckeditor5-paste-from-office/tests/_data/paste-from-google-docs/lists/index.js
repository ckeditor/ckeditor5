/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import nestedOrderedList from './nested-ordered-lists/input.html';
import nestedOrderedListNormalized from './nested-ordered-lists/normalized.html';
import nestedOrderedListModel from './nested-ordered-lists/model.html';

export const fixtures = {
	input: {
		nestedOrderedList
	},
	normalized: {
		nestedOrderedList: nestedOrderedListNormalized
	},
	model: {
		nestedOrderedList: nestedOrderedListModel
	}
};

export const browserFixtures = {};
