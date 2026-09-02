/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ro': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Marcaj',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Editează marcajul',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Elimină marcajul',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Numele marcajului',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Introdu numele marcajului fără spații.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Marcajul nu poate fi gol.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Numele marcajului nu poate conține spații.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Numele marcajului există deja.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget marcaj',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Bara de instrumente Marcaj',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Marcaje',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Nu sunt disponibile marcaje.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Derulați la marcaj'
		}
	}
};

export default translations;
