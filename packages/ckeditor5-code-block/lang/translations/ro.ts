/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ro': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Inserează un bloc code',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Text simplu',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': 'Ieșire din fragmentul de cod %0',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': 'Intrare în fragmentul de cod %0',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Intrare în fragmentul de cod',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Ieșire din fragmentul de cod',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Bloc de cod'
		}
	}
};

export default translations;
