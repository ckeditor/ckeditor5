/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'cs': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'Najít a nahradit',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'Najít v textu...',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'Najít',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'Předchozí výskyt',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'Další výskyt',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'Nahradit',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'Nahradit vše',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'Rozlišovat velikost písmen',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'Pouze celá slova',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'Nahradit čím...',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'Hledaný text nesmí být prázdný.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'Tip: Nejprve najděte nějaký text, abyste jej mohli nahradit.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'Pokročilé možnosti',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'Najít v dokumentu'
		}
	}
};

export default translations;
