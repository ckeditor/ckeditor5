/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { makeData as formattingLongP } from './formatting-long-paragraphs.js';
import { makeData as ghs } from './ghs.js';
import { makeData as inlineStyles } from './inline-styles.js';
import { makeData as lists } from './lists.js';
import { makeData as mixed } from './mixed.js';
import { makeData as paragraphs } from './paragraphs.js';
import { makeData as tableHuge } from './table-huge.js';
import { makeData as wiki } from './wiki.js';

export const allDataSets = {
	formattingLongP: formattingLongP(),
	ghs: ghs(),
	inlineStyles: inlineStyles(),
	lists: lists(),
	mixed: mixed(),
	paragraphs: paragraphs(),
	tableHuge: tableHuge(),
	wiki: wiki()
};
