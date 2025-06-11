/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark
 */

export { Bookmark } from './bookmark.js';
export { BookmarkEditing } from './bookmarkediting.js';
export { BookmarkUI } from './bookmarkui.js';
export { InsertBookmarkCommand } from './insertbookmarkcommand.js';
export { UpdateBookmarkCommand } from './updatebookmarkcommand.js';
export { BookmarkFormView, type BookmarkFormValidatorCallback, type BookmarkFormViewCancelEvent } from './ui/bookmarkformview.js';

export type { BookmarkConfig } from './bookmarkconfig.js';

export { isBookmarkIdValid as _isBookmarkIdValid } from './utils.js';

import './augmentation.js';
