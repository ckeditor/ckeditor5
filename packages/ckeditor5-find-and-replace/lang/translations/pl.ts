/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pl': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Znajdź i zamień',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Znajdź…',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Znajdź',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Poprzedni',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Następny',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Zamień',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Zamień wszystko',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Uwzględnij wielkość liter',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Znajdź tylko całe wyrazy',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Zamień na…',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'Szukany tekst nie może być pusty.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Podpowiedź: Znajdź jakiś tekst, aby go zamienić.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Opcje zaawansowane',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Otwiera interfejs Znajdź w dokumencie'
		}
	}
};

export default translations;
