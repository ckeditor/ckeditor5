/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'da': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Bogmærke',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Rediger bogmærke',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Fjern bogmærke',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Bogmærkenavn',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Indtast bogmærkenavnet uden mellemrum.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Bogmærke må ikke være tomt.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Bogmærkenavnet må ikke indholde mellemrum.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Bogmærkenavnet findes allerede.',
			// The label for the bookmark widget.
			'bookmark widget': 'bogmærke-widget',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Bogmærkelinje',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Bogmærker',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Ingen bogmærker tilgængelige.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Rul til bogmærke'
		}
	}
};

export default translations;
