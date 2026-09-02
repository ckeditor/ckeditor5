/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'be': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Закладка',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Змяніць закладку',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Выдаліць закладку',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Імя закладкі',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Увядзіце імя закладкі без прабелаў.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Закладка не можа быць пустой.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Імя закладкі не можа ўтрымліваць прабелы.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Імя закладкі ўжо існуе.',
			// The label for the bookmark widget.
			'bookmark widget': 'віджэт закладкаў',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': '',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': '',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': '',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': ''
		}
	}
};

export default translations;
