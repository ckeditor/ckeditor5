/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Rechercher et remplacer',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Rechercher dans le texte...',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Rechercher',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Résultat précédent',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Résultat suivant',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Remplacer',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Remplacer tout',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Sensible à la casse',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Mots entiers uniquement',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Remplacer par ...',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'L\'expression à rechercher ne doit pas être vide',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Astuce : rechercher une expression afin de la remplacer',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Options avancées',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Rechercher dans le document'
		}
	}
};

export default translations;
