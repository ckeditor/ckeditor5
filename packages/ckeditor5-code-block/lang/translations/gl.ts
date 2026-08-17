/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'gl': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Inserir bloque de código',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Texto simple',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': 'Abandonando o fragmento de código %0',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': 'Introducindo o fragmento de código %0',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Introducindo un fragmento de código',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Abandonando o fragmento de código',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Bloque de código '
		}
	}
};

export default translations;
