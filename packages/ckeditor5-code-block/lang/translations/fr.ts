/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Insérer un bloc de code',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Texte brut',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': 'Laisser un extrait de code %0',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': 'Saisie d\'un extrait de code %0',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Saisie d\'un extrait de code',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Laisser un extrait de code',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Bloc de code'
		}
	}
};

export default translations;
