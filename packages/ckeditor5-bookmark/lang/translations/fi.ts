/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Kirjanmerkki',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Muokkaa kirjanmerkkiä',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Poista kirjanmerkki',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Kirjanmerkin nimi',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Lisää kirjanmerkin nimi ilman välilyöntejä',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Kirjanmerkkiä ei saa jättää tyhjäksi.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Kirjanmerkin nimessä ei saa olla välilyöntejä.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Kirjanmerkin nimi on jo käytössä.',
			// The label for the bookmark widget.
			'bookmark widget': 'kirjanmerkkien pienoisohjelma',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Kirjanmerkkien työkalupalkki',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Kirjanmerkit',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Kirjanmerkkejä ei käytettävissä.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Vieritä kirjanmerkkiin'
		}
	}
};

export default translations;
