/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr-latn': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Nađji i zameni',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Pronađji u tekstu…',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Pronađji',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Prethodni rezultat',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Sledeći rezultat',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Zameni',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Zameni sve',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Podudaranje slučaj',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Samo cele reči',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Zameni sa…',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'Tekst za pronalaženje ne sme biti prazan.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Savet: Prvo pronađjite neki tekst da biste ga zamenili.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Napredne opcije',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Pronađite u dokumentu'
		}
	}
};

export default translations;
