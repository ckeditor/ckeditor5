/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Obeleživač',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Uredi obeleživač',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Ukloni obeleživač',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Naziv obeleživača',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Unesite naziv obeleživača bez razmaka.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Naziv obeleživača ne sme biti prazan.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Naziv obeleživača ne može da sadrži znakove sa razmakom.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Naziv obeleživača već postoji.',
			// The label for the bookmark widget.
			'bookmark widget': 'vidžet obeleživača',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Traka sa alatkama za obeleživače',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Obeleživači',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Nema dostupnih obeleživača.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Dođite do obeleživača'
		}
	}
};

export default translations;
