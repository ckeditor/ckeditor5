/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Könyvjelző',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Könyvjelző szerkesztése',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Könyvjelző törlése',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Könyvjelző neve',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Írja be a könyvjelző nevét szóközök nélkül.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'A könyvjelző nem lehet üres.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'A könyvjelző neve nem tartalmazhat szóköz karaktereket.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'A könyvjelzőnév már létezik.',
			// The label for the bookmark widget.
			'bookmark widget': 'könyvjelző widget',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Könyvjelző eszköztár',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Könyvjelzők',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Nincs könyvjelző',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Görgetés a könyvjelzőhöz'
		}
	}
};

export default translations;
