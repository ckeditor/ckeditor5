/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// A label of the button that allows inserting a new code block into the editor content.
			'Insert code block': 'Chèn khối mã',
			// A language of the code block in the editor content when no specific programming language is associated with it.
			'Plain text': 'Văn bản thuần',
			// Assistive technologies label for leaving the code block with a specified programming language. Example: 'Leaving JavaScript code snippet'
			'Leaving %0 code snippet': 'Đang rời khỏi đoạn mã snippet %0',
			// Assistive technologies label for entering the code block with a specified programming language. Example: 'Entering JavaScript code snippet'
			'Entering %0 code snippet': 'Đang nhập đoạn mã snippet %0',
			// Assistive technologies label for entering the code block with unspecified programming language.
			'Entering code snippet': 'Đang nhập đoạn mã snippet',
			// Assistive technologies label for leaving the code block with unspecified programming language.
			'Leaving code snippet': 'Đang rời khỏi đoạn mã snippet',
			// The accessible label of the menu bar button that inserts a code block into editor content.
			'Code block': 'Khối mã'
		}
	}
};

export default translations;
