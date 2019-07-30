/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import listInTable from './list-in-table/input.html';
import listInTableNormalized from './list-in-table/normalized.html';
import listInTableModel from './list-in-table/model.html';

export const fixtures = {
	input: {
		listInTable
	},
	normalized: {
		listInTable: listInTableNormalized
	},
	model: {
		listInTable: listInTableModel
	}
};

export const browserFixtures = {};
