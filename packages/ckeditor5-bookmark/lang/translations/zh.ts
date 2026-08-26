/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': '書籤',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': '編輯書籤',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': '移除書籤',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': '書籤名稱',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': '輸入書籤名稱，請勿包含空格。',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': '書籤名稱不得為空。',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': '書籤名稱不可包含空格字元。',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': '書籤名稱已存在。',
			// The label for the bookmark widget.
			'bookmark widget': '書籤小工具',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': '書籤工具列',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': '書籤',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': '無可用書籤。',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': '捲動至書籤'
		}
	}
};

export default translations;
