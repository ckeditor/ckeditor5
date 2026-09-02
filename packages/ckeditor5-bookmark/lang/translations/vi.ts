/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Dấu trang',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Chỉnh sửa dấu trang',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Xóa dấu trang',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Tên dấu trang',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Nhập tên dấu trang không có khoảng trắng.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Dấu trang không được để trống.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Tên dấu trang không được chứa ký tự khoảng trắng.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Tên dấu trang đã tồn tại.',
			// The label for the bookmark widget.
			'bookmark widget': 'tiện ích đánh dấu trang',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Thanh công cụ Đánh dấu trang',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Dấu trang',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Không có dấu trang khả dụng.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Cuộn chuột đến dấu trang'
		}
	}
};

export default translations;
