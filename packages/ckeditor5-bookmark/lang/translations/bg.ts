/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bg': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Отметка',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Редактиране на отметка',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Премахване на отметка',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Име на отметка',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Въведете името на отметката без интервали.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Отметката не трябва да е празна.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Името на отметката не може да съдържа интервали.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Името на отметката вече съществува.',
			// The label for the bookmark widget.
			'bookmark widget': 'изпълним модул за отметки',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Лента с отметки',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Отметки',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Няма налични отметки',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Превъртане до отметка'
		}
	}
};

export default translations;
