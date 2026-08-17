/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Suchen und ersetzen',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'In Text suchen…',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Suchen',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Vorheriges Ergebnis',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Nächstes Ergebnis',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Ersetzen',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Alle ersetzen',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Groß-/Kleinschreibung beachten',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Nur ganze Wörter',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Ersetzen durch…',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'Der Suchtext darf nicht leer sein.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Tipp: Zuerst nach Text suchen um diesen zu ersetzen.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Erweiterte Optionen',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Dokument durchsuchen'
		}
	}
};

export default translations;
