/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'cs': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Záložka',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Upravit záložku',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Odstranit záložku',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Název záložky',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Zadejte název záložky bez mezer.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Záložka nesmí být prázdná',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Název záložky nemůže obsahovat znaky mezery.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Záložka s tímto názvem už existuje.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget záložky',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Panel nástrojů záložek',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Záložky',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Žádné záložky nejsou k dispozici',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Přejít na záložku'
		}
	}
};

export default translations;
