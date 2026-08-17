/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'el': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Σελιδοδείκτης',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Επεξεργασία σελιδοδείκτη',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Κατάργηση σελειδοδείκτη',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Όνομα σελιδοδείκτη',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Εισαγάγετε το όνομα του σελιδοδείκτη χωρίς κενά.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Ο σελιδοδείκτης δεν πρέπει να είναι κενός.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Το όνομα του σελιδοδείκτη δεν μπορεί να περιέχει χαρακτήρες κενού διαστήματος.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Το όνομα σελιδοδείκτη υπάρχει ήδη.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget σελιδοδείκτη',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Γραμμή εργαλείων σελιδοδεικτών',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Σελιδοδείκτες',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Δεν υπάρχουν διαθέσιμοι σελιδοδείκτες.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Κάντε κύλιση στον σελιδοδείκτη'
		}
	}
};

export default translations;
