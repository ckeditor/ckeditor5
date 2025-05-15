/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark/bookmark
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Widget } from 'ckeditor5/src/widget.js';
import BookmarkUI from './bookmarkui.js';
import BookmarkEditing from './bookmarkediting.js';

/**
 * The bookmark feature.
 *
 * For a detailed overview, check the {@glink features/bookmarks Bookmarks} feature guide.
 */
export default class Bookmark extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Bookmark' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ BookmarkEditing, BookmarkUI, Widget ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
