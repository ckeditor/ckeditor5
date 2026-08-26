/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': '查找和替换',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': '查找的文本',
			// The label for the find action button in the find and replace dropdown.
			'Find': '查找',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': '上一个匹配项',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': '下一个匹配项',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': '替换',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': '全部替换',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': '区分大小写',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': '单词',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': '替换的文本',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': '查找的文本不可为空',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': '提示：先查找文本再替换',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': '高级选项',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': '在文档中查找'
		}
	}
};

export default translations;
