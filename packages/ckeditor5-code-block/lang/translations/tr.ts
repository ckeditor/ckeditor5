/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'tr': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Kod bloğu ekle',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Düz metin',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': '%0 kod parçacığından ayrılınıyor',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': '%0 kod parçacığına girmek',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Kod parçacığına girmek',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Kod parçacığından ayrılma',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Kod bloku'
		}
	}
};

export default translations;
