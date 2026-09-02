/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'lt': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Adresyno įrašas',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Redaguoti adresyno įrašą',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Pašalinti adresyno įrašą',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Adresyno įrašo pavadinimas',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Įveskite adresyno įrašo pavadinimą be tarpų.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Adresyno įrašas negali būti tuščias.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Adresyno įrašo pavadinimas negali turėti specialiųjų ženklų.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Toks adresyno įrašo pavadinimas jau yra naudojamas.',
			// The label for the bookmark widget.
			'bookmark widget': 'adresyno įrašo valdiklis',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Adresyno įrašų įrankių juosta',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Adresyno įrašai',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Nėra jokių adresyno įrašų',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Slinkite prie žymeklio'
		}
	}
};

export default translations;
