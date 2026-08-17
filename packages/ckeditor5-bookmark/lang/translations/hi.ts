/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hi': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'बुकमार्क',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'बुकमार्क एडिट करें',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'बुकमार्क हटाएं',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'बुकमार्क का नाम',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'बिना स्पेस के बुकमार्क का नाम लिखें.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'बुकमार्क खाली नहीं होना चाहिए.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'बुकमार्क नाम में स्पेस नहीं हो सकते.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'बुकमार्क नाम पहले से मौजूद है.',
			// The label for the bookmark widget.
			'bookmark widget': 'बुकमार्क विजिट',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'बुकमार्क टूलबार',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'बुकमार्क',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'कोई बुकमार्क उपलब्ध नहीं है.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'बुकमार्क करने के लिए स्क्रॉल करें'
		}
	}
};

export default translations;
