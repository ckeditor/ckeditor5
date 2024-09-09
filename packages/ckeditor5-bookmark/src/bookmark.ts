/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/bookmark
 */

import { Plugin } from 'ckeditor5/src/core.js';
import BookmarkUI from './bookmarkui.js';
import BookmarkEditing from './bookmarkediting.js';

/**
 * The bookmark feature.
 *
 * For a detailed overview, check the {@glink features/bookmark Bookmark} feature guide.
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
		return [ BookmarkEditing, BookmarkUI ] as const;
	}
}
