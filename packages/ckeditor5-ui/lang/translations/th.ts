/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'โปรแกรมแก้ไข Rich Text',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'แก้ไขบล็อก',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'คลิกเพื่อแก้ไขบล็อก',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'ลากเพื่อย้าย',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'ถัดไป',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'ก่อนหน้า',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'แถบเครื่องมือแก้ไข',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'แถบเครื่องมือแบบเลื่อนลง',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'เมนูแบบเลื่อนลง',
			// Label of a button that applies a black color in color pickers.
			'Black': 'สีดำ',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'สีเทาเข้ม',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'สีเทา',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'สีเทาอ่อน',
			// Label of a button that applies a white color in color pickers.
			'White': 'สีขาว',
			// Label of a button that applies a red color in color pickers.
			'Red': 'สีแดง',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'สีส้ม',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'สีเหลือง',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'สีเขียวอ่อน',
			// Label of a button that applies a green color in color pickers.
			'Green': 'สีเขียว',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'พลอยสีฟ้า',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'สีเขียวขุ่น',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'สีฟ้า',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'สีน้ำเงิน',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'สีม่วง',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'แถบเครื่องมือแก้ไขบล็อกเนื้อหา',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'แถบเครื่องมือแก้ไขข้อความ',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'ไม่พบผลลัพธ์',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'ไม่มีรายการที่สามารถค้นหาได้',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'การสนทนาของบรรณาธิการ',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'ปิด',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'เนื้อหาความช่วยเหลือ หากต้องการปิดกล่องโต้ตอบนี้ ให้กดปุ่ม ESC',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'ด้านล่างนี้ คุณจะพบกับรายการแป้นพิมพ์ลัดที่สามารถใช้ในตัวแก้ไขได้',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(อาจจำเป็นต้องมี <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'การเข้าถึง',
			// Accessibility help dialog title.
			'Accessibility help': 'ความช่วยเหลือการเข้าถึง',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'กด %0 เพื่อความช่วยเหลือ',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'ย้ายโฟกัสเข้าและออกจากกล่องโต้ตอบที่ใช้งานอยู่',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'ไฟล์',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'แก้ไข',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'ดู',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'แทรก',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'รูปแบบ',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'เครื่องมือ',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'ช่วยเหลือ',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'ข้อความ',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'แบบอักษร',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'แถบเมนูตัวแก้ไข',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'โปรดป้อนสีที่ถูกต้อง (เช่น "ff0000")'
		}
	}
};

export default translations;
