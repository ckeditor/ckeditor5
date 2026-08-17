/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Lesezeichen',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Lesezeichen bearbeiten',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Lesezeichen entfernen',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Name des Lesezeichens',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Geben Sie den Namen des Lesezeichens ohne Leerzeichen ein.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Das Lesezeichen darf nicht leer sein.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Der Name des Lesezeichens darf keine Leerzeichen enthalten.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Der Lesezeichenname existiert bereits.',
			// The label for the bookmark widget.
			'bookmark widget': 'Lesezeichen-Widget',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Lesezeichen-Werkzeugleiste',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Lesezeichen',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Keine Lesezeichen verfügbar.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Zu Lesezeichen scrollen'
		}
	}
};

export default translations;
