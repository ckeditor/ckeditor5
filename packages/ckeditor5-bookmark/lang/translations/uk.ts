/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'uk': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Закладка',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Редагувати закладку',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Видалити закладку',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Назва закладки',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Введіть назву закладки без пробілів.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Закладка не може бути порожньою.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Назва закладки не може містити пробілів.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Назва закладки вже існує.',
			// The label for the bookmark widget.
			'bookmark widget': 'віджет закладок',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Панель закладок',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Закладки',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Немає доступних закладок.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Прокрутити до закладки'
		}
	}
};

export default translations;
