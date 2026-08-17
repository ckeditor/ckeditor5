/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Kód blokk beszúrása',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Egyszerű szöveg',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': '%0 kódrészlet elhagyása',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': '%0 kódrészlet bevitele',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Kódrészlet bevitele',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Kódrészlet elhagyása',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Kódblokk'
		}
	}
};

export default translations;
