/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'el': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Εύρεση και αντικατάσταση',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Εύρεση στο κείμενο...',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Εύρεση',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Προηγούμενο αποτέλεσμα',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Επόμενο αποτέλεσμα',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Αντικατάσταση',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Αντικατάσταση όλων',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Ταίριασμα πεζών-ΚΕΦΑΛΑΙΩΝ',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Μόνο ολόκληρες λέξεις',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Αντικατάσταση με...',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'Το κείμενο προς εύρεση δεν πρέπει να είναι άδειο.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Επισήμανση: Βρείτε κάποιο κείμενο αρχικά ώστε να το αντικαταστήσετε.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Προηγμένες επιλογές',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Εύρεση στο έγγραφο'
		}
	}
};

export default translations;
