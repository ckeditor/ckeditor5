/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// The tooltip of a find and replace button in the toolbar. Also, the title of the find and replace form.
			'Find and replace': 'ค้นหาและแทนที่',
			// The label for the searched text in the find and replace dropdown.
			'Find in text…': 'ค้นหาในข้อความ...',
			// The label for the find action button in the find and replace dropdown.
			'Find': 'ค้นหา',
			// The label for the previous result button in the find and replace dropdown.
			'Previous result': 'ผลลัพธ์ก่อนหน้านี้',
			// The label for the previous result button in the find and replace dropdown.
			'Next result': 'ผลลัพธ์ถัดไป',
			// The label for the (single) replace action button in the find and replace dropdown.
			'Replace': 'แทนที่',
			// The label for the replace all action button in the find and replace dropdown.
			'Replace all': 'แทนที่ทั้งหมด',
			// The label for the match case checkbox in the find and replace dropdown.
			'Match case': 'ตัวใหญ่-เล็ก ตรงกัน',
			// The label for the whole words only checkbox in the find and replace dropdown.
			'Whole words only': 'ตรงกันทุกตัวอักษร',
			// The label for the text replacement in the find and replace dropdown.
			'Replace with…': 'แทนที่ด้วย...',
			// An error text displayed when user attempted to find an empty text.
			'Text to find must not be empty.': 'ข้อความที่จะค้นหาต้องไม่ว่างเปล่า',
			// A message displayed next to the replace field when disabled but user tries to use it.
			'Tip: Find some text first in order to replace it.': 'เคล็ดลับ: ค้นหาข้อความบางอย่างก่อนจึงจะแทนที่ได้',
			// The label and the tooltip of the options dropdown button in the find and replace form.
			'Advanced options': 'ตัวเลือกขั้นสูง',
			// Keystroke description for assistive technologies: keystroke for opening the find and replace UI.
			'Find in the document': 'ค้นหาในเอกสาร'
		}
	}
};

export default translations;
