/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': '찾기 및 바꾸기',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': '텍스트에서 찾기...',
			// The label for the find action button in the find and replace dropdown.
			'Find': '찾기',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': '이전 결과',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': '다음 결과',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': '바꾸기',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': '모두 바꾸기',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': '대/소문자 구분',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': '전체 단어만',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': '바꿀 내용...',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': '찾을 텍스트를 입력해야 합니다.',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': '팁: 바꾸려는 텍스트를 먼저 찾으세요.',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': '고급 옵션',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': '문서에서 찾기'
		}
	}
};

export default translations;
