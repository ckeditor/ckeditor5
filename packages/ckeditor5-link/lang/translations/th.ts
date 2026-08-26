/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'ยกเลิกการลิงก์',
			// Toolbar button tooltip for the Link feature.
			'Link': 'ลิงก์',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'ลิงก์ URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL ของลิงก์ต้องไม่เว้นว่าง',
			// Label for the image link button.
			'Link image': 'ลิงก์ภาพ',
			// Label for the link properties link balloon title.
			'Link properties': 'คุณสมบัติลิงก์',
			// Button opening the Link URL editing balloon.
			'Edit link': 'แก้ไขลิงก์',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'เปิดลิงก์ในแท็บใหม่',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'เปิดในแท็บใหม่',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'ที่สามารถดาวน์โหลดได้',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'สร้างลิงก์',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'ย้ายออกจากลิงก์',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'ข้อความที่แสดง',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'ไม่มีลิงก์พร้อมใช้งาน',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'ลิงก์นี้ไม่มี URL'
		}
	}
};

export default translations;
