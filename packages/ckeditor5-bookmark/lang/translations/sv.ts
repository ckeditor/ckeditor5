/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sv': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Bokmärke',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Redigera bokmärke',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Ta bort bokmärke',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Bokmärkets namn',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Ange bokmärkets namn utan mellanslag.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Bokmärkets namn kan inte vara tomt.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Bokmärkets namn kan inte innehålla mellanslag.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Bokmärkets namn finns redan.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget för bokmärken',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Bokmärk verktygsfältet',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Bokmärken',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Inga bokmärken tillgängliga.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Skrolla till bokmärket'
		}
	}
};

export default translations;
