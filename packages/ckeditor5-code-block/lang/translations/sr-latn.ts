/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr-latn': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Dodaj blok koda',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Običan tekst',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': 'Ostavljate %0 isečak koda',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': 'Unosite %0 isečak koda',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Unošenje isečka koda',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Ostavljanje fragmenta koda  ',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Blok koda'
		}
	}
};

export default translations;
