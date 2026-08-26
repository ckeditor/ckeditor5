/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'he': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'סימניה',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'ערכו סימניה',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'הסירו סימניה',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'שם הסימניה',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'הקלידו את שם הסימניה ללא רווחים.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'לא ניתן שהסימניה תהיה ריקה',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'שם הסימניה לא יכול להכיל רווחים',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'שם הסימניה כבר קיים',
			// The label for the bookmark widget.
			'bookmark widget': 'יישומון הסימניה',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'סרגל כלים לסימניות',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'סימניות',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'אין סימניות זמינות.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'גלול לסימניה'
		}
	}
};

export default translations;
