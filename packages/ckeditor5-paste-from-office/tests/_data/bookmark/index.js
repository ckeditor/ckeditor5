/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import image from './image/input.word.html';
import imageModel from './image/model.word.html';
import table from './table/input.word.html';
import tableModel from './table/model.word.html';
import other from './other/input.word.html';
import otherModel from './other/model.word.html';

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
