/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Keresés és csere',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Keresés szövegben...',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Keresés',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Előző találat',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Következő találat',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Csere',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Mind cserél',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Nagybetű érzékeny',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Csak teljes szavak',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Csere erre...',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'A keresendő szöveg nem lehet üres.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Tipp: Először keressen egy szöveget, hogy lecserélhesse.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Speciális beállítások',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Keresés a dokumentumban'
		}
	}
};

export default translations;
