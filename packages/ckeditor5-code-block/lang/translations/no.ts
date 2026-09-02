/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Sett inn kodeblokk',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Ren tekst',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': 'Forlater %0 kodesnutt',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': 'Skriver inn %0 kodesnutt',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Skriver inn kodesnutt',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Forlater kodesnutt',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Kodeblokk'
		}
	}
};

export default translations;
