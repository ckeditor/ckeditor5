/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'ยกเลิก',
			// Label for the Clear button.
			'Clear': 'ล้าง',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'ลบสี',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'คืนค่าเริ่มต้น',
			// Label for the Save button.
			'Save': 'บันทึก',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'แสดงรายการเพิ่มเติม',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 จาก %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'ไม่สามารถอัปโหลดไฟล์ได้:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'ตัวแก้ไข Rich Text พื้นที่แก้ไข: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'แทรกด้วยตัวจัดการไฟล์',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'แทนที่ด้วยตัวจัดการไฟล์',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'แทรกภาพด้วยตัวจัดการไฟล์',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'แทนที่ภาพด้วยตัวจัดการไฟล์',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'ไฟล์',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'ด้วยโปรแกรมจัดการไฟล์',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'ปิดคำอธิบายภาพ',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'เปิดคำอธิบายภาพ',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'แป้นพิมพ์ลัดเพื่อแก้ไขเนื้อหา',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'แป้นพิมพ์ลัดเหล่านี้จะทำให้สามารถเข้าถึงฟีเจอร์เพื่อการแก้ไขเนื้อหาได้อย่างรวดเร็ว',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'แป้นพิมพ์ลัดในอินเตอร์เฟสผู้ใช้และการนำทางเนื้อหา',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'ใช้แป้นพิมพ์ลัดต่อไปนี้เพื่อการนำทางที่มีประสิทธิภาพยิ่งขึ้นในอินเตอร์เฟสผู้ใช้ CKEditor 5',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'ปิดลูกโป่งบริบท, รายการดรอปดาวน์, และกล่องโต้ตอบ',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'เปิดกล่องโต้ตอบความช่วยเหลือการเข้าถึง',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'ย้ายโฟกัสระหว่างช่องฟอร์ม (รับข้อมูล, ปุ่ม, ฯลฯ)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'ย้ายโฟกัสไปที่แถบเมนู นำทางระหว่างแถบเมนูต่างๆ',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'ย้ายโฟกัสไปยังแถบเครื่องมือ, นำทางภายในแถบเครื่องมือ',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'นำทางในแถบเครื่องมือหรือแถบเมนู',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'ปฏิบัติตามปุ่มที่โฟกัสในขณะนี้ การปฏิบัติตามปุ่มที่โต้ตอบกับเนื้อหาของตัวแก้ไขจะย้ายโฟกัสกลับไปยังเนื้อหา',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'ยอมรับ',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'ซอร์ส',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'ย่อหน้า',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'เครื่องมือเลือกสี',
			// Label for the Insert button.
			'Insert': 'แทรก',
			// Label for the Update button.
			'Update': 'อัปเดต',
			// Label for the Back button.
			'Back': 'ย้อนกลับ',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'โปรดลองใช้วลีอื่นหรือตรวจสอบตัวสะกด',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'ตัดคำข้อความ',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'แบ่งข้อความ',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'กำหนดเอง',
			// The default label for the resize option that resets the size.
			'Original': 'ดั้งเดิม',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'ค่าต้องไม่ว่างเปล่า',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'ค่าควรเป็นตัวเลขธรรมดา'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
