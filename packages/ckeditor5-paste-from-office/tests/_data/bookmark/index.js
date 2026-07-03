/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import image from './image/input.word.html?raw';
import imageModel from './image/model.word.html?raw';
import table from './table/input.word.html?raw';
import tableModel from './table/model.word.html?raw';
import other from './other/input.word.html?raw';
import otherModel from './other/model.word.html?raw';

export const fixtures = {
	input: {
		image,
		table,
		other
	},
	model: {
		image: imageModel,
		table: tableModel,
		other: otherModel
	}
};
