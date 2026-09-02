/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': '书签',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': '编辑书签',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': '删除书签',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': '书签名称',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': '输入书签名称，不带空格。',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': '书签不能为空。',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': '书签名称不能包含空格。',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': '书签名称已存在。',
			// The label for the bookmark widget.
			'bookmark widget': '书签小组件',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': '书签工具栏',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': '书签',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': '无可用书签。',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': '滚动到书签'
		}
	}
};

export default translations;
