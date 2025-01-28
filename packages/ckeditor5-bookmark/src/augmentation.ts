/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Bookmark,
	BookmarkEditing,
	BookmarkUI,
	InsertBookmarkCommand,
	UpdateBookmarkCommand,
	BookmarkConfig
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:bookmark/bookmark~Bookmark} feature.
		 *
		 * Read more in {@link module:bookmark/bookmarkconfig~BookmarkConfig}.
		 */
		bookmark?: BookmarkConfig;
	}
	interface PluginsMap {
		[ Bookmark.pluginName ]: Bookmark;
		[ BookmarkEditing.pluginName ]: BookmarkEditing;
		[ BookmarkUI.pluginName ]: BookmarkUI;
	}

	interface CommandsMap {
		insertBookmark: InsertBookmarkCommand;
		updateBookmark: UpdateBookmarkCommand;
	}
}
