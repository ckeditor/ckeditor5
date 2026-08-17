/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pl': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Zakładka',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Edytuj zakładkę',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Usuń zakładkę',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Nazwa zakładki',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Wprowadź nazwę zakładki bez spacji.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Nazwa zakładki nie może być pusta.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Nazwa zakładki nie może zawierać spacji.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Zakładka o takiej nazwie już istnieje.',
			// The label for the bookmark widget.
			'bookmark widget': 'widżet zakładek',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Pasek narzędzi zakładek',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Zakładki',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Brak dostępnych zakładek.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Przewiń do zakładki'
		}
	}
};

export default translations;
