/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Søk og erstatt',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Søk i tekst',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Søk',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Forrige resultat',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Neste resultat',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Erstatt',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Erstatt alt',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Skill mellom store og små bokstaver',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Kun hele ord',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Erstatt med …',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'Teksten som skal finnes må ikke være tom',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Tips: Finn noe tekst først for å kunne erstatte den.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Avanserte alternativer',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Finn i dokumentet'
		}
	}
};

export default translations;
