/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import paragraphs from './paragraphs.js';
import lists from './lists.js';
import tableHuge from './table-huge.js';
import tablesMany from './tables-many-smaller.js';
import formattingLongP from './formatting-long-paragraphs.js';
import formattingShortP from './formatting-short-paragraphs.js';
import inlineStyles from './inline-styles.js';
import mixed from './mixed.js';
// Below data sets were tested, and they do not differ vs above tests.
// import paragraphsLong from './paragraphs-long.js';
// import images from './images.js';

export default {
	paragraphs, lists, tableHuge, tablesMany, formattingLongP, formattingShortP, inlineStyles, mixed
};
