/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'et': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Järjehoidja',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Muuda järjehoidjat',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Eemalda järjehoidja',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Järjehoidja nimi',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Sisestage järjehoidja nimi ilma tühikuteta.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Järjehoidja väli ei tohi olla tühi.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Järjehoidja nimi ei tohi sisaldada tühikuid.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Järjehoidja nimi on juba olemas.',
			// The label for the bookmark widget.
			'bookmark widget': 'järjehoidja vidin',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Järjehoidjariba',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Järjehoidjad',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Ühtegi järjehoidjat pole saadaval.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Keri järjehoidjani'
		}
	}
};

export default translations;
