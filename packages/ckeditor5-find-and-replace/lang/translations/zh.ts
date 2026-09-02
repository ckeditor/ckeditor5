/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': '尋找和取代',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': '在文本中尋找',
			// The label for the find action button in the find and replace dropdown.
			'Find': '尋找',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': '前一個結果',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': '後一個結果',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': '取代',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': '全部取代',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': '大小寫需相符',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': '僅全字拼寫',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': '以…替代',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': '不能查找空字串',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': '提示：先查找字串再取代',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': '進階選項',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': '在文件中尋找'
		}
	}
};

export default translations;
