/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'lv': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Grāmatzīme',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Rediģēt grāmatzīmi',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Aizvākt grāmatzīmi',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Grāmatzīmes nosaukums',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Ievadiet grāmatzīmes nosaukumu bez atstarpēm.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Grāmatzīmes lauks nedrīkst būt tukšs.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Grāmatzīmes nosaukumā nedrīkst būt atstarpes.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Šāds grāmatzīmes nosaukums jau pastāv.',
			// The label for the bookmark widget.
			'bookmark widget': 'grāmatzīmju ikona',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Grāmatzīmju rīkjosla',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Grāmatzīmes',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Grāmatzīmes nav pieejamas.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Pārvieto līdz grāmatzīmei'
		}
	}
};

export default translations;
