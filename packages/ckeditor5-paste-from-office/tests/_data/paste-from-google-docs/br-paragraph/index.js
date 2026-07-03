/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import simpleParagraphs from './simple-paragraphs/input.html?raw';
import simpleParagraphsNormalized from './simple-paragraphs/normalized.html?raw';
import simpleParagraphsModel from './simple-paragraphs/model.html?raw';

export const fixtures = {
	input: {
		simpleParagraphs
	},
	normalized: {
		simpleParagraphs: simpleParagraphsNormalized
	},
	model: {
		simpleParagraphs: simpleParagraphsModel
	}
};
