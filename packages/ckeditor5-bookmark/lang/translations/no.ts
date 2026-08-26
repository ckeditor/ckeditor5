/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Bokmerk',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Rediger bokmerke',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Fjern bokmerke',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Navn på bokmerke',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Oppgi bokmerkets navn uten mellomrom.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Bokmerket kan ikke være tomt.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Bokmerkets navn kan ikke inneholde mellomrom.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Bokmerkets navn finnes allerede.',
			// The label for the bookmark widget.
			'bookmark widget': 'bokmerke-widget',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Bokmerkeverktøylinje',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Bokmerker',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Ingen bokmerker tilgjengelig.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Skroll til bokmerke'
		}
	}
};

export default translations;
