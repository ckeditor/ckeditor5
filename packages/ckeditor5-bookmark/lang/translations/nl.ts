/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'nl': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Bladwijzer',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Bladwijzer bewerken',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Bladwijzer verwijderen',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Naam van de bladwijzer',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Voer de naam van de bladwijzer in zonder spaties.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Bladwijzer mag niet leeg zijn.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Naam van de bladwijzer mag geen spaties bevatten.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Naam van de bladwijzer bestaat al.',
			// The label for the bookmark widget.
			'bookmark widget': 'bladwijzer widget',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Bladwijzerwerkbalk',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Bladwijzers',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Geen bladwijzers beschikbaar.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Scroll naar bladwijzer'
		}
	}
};

export default translations;
