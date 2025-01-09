/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark
 */

export { default as Bookmark } from './bookmark.js';
export { default as BookmarkEditing } from './bookmarkediting.js';
export { default as BookmarkUI } from './bookmarkui.js';
export { default as InsertBookmarkCommand } from './insertbookmarkcommand.js';
export { default as UpdateBookmarkCommand } from './updatebookmarkcommand.js';

export type { BookmarkConfig } from './bookmarkconfig.js';

import './augmentation.js';
