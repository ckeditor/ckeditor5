/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ar': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'إشارة مرجعية',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'تحرير الإشارة المرجعية',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'إزالة الإشارة المرجعية',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'اسم الإشارة المرجعية',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'أدخل اسم الإشارة المرجعية بدون مسافات.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'لا يجب أن تكون الإشارة المرجعية فارغة.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'لا يمكن أن يحتوي اسم الإشارة المرجعية على مسافة.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'اسم الإشارة المرجعية موجود بالفعل.',
			// The label for the bookmark widget.
			'bookmark widget': 'أداة الإشارة المرجعية',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'شريط أدوات الإشارة المرجعية',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'الإشارات المرجعية',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'لا توجد إشارات مرجعية متاحة.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'مرر إلى الإشارة المرجعية'
		}
	}
};

export default translations;
