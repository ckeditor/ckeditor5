/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// Toolbar button tooltip for the HTML embed feature.
			'Insert HTML': 'แทรก HTML',
			// The HTML snippet.
			'HTML snippet': 'ส่วนย่อยของ HTML',
			// A placeholder that will be displayed in the raw HTML textarea field.
			'Paste raw HTML here...': 'วาง HTML ดิบที่นี่...',
			// A label of a button that switches the HTML embed to the source editing mode.
			'Edit source': 'แก้ไขซอร์ส',
			// A label of a button that saves the HTML embed content and navigates back to the preview.
			'Save changes': 'บันทึกการเปลี่ยนแปลง',
			// An information displayed in the HTML embed preview if the content is not previewable.
			'No preview available': 'ไม่มีภาพตัวอย่างให้ใช้งาน',
			// An information displayed in the HTML embed preview if the HTML snippet has no content.
			'Empty snippet content': 'เนื้อหาส่วนย่อยว่างเปล่า'
		}
	}
};

export default translations;
