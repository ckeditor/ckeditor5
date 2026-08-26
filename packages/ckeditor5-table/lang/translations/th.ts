/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'th': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'แทรกตาราง',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'แทรกรูปแบบตาราง',
			// Label for the set/unset table header column button.
			'Header column': 'หัวข้อคอลัมน์',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'แทรกคอลัมน์ทางซ้าย',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'แทรกคอลัมน์ทางขวา',
			// Label for the delete table column button.
			'Delete column': 'ลบคอลัมน์',
			// Label for the select the entire table column button.
			'Select column': 'เลือกคอลัมน์',
			// Label for the table column dropdown button.
			'Column': 'คอลัมน์',
			// Label for the set/unset table header row button.
			'Header row': 'ส่วนหัวแถว',
			// Label for the set/unset table footer row button.
			'Footer row': 'แถวส่วนท้าย',
			// Label for the insert row below button.
			'Insert row below': 'แทรกส่วนหัวด้านล่าง',
			// Label for the insert row above button.
			'Insert row above': 'แทรกส่วนหัวด้านบน',
			// Label for the delete table row button.
			'Delete row': 'ลบแถว',
			// Label for the select the entire table row button.
			'Select row': 'เลือกแถว',
			// Label for the table row dropdown button.
			'Row': 'แถว',
			// Label for the merge table cell up button.
			'Merge cell up': 'ผสานเซลล์ด้านบน',
			// Label for the merge table cell right button.
			'Merge cell right': 'ผสานเซลล์ด้านขวา',
			// Label for the merge table cell down button.
			'Merge cell down': 'ผสานเซลล์ด้านล่าง',
			// Label for the merge table cell left button.
			'Merge cell left': 'ผสานเซลล์ด้านซ้าย',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'แยกเซลล์แนวตั้ง',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'แยกเซลล์แนวนอน',
			// Label for the merge table cells button.
			'Merge cells': 'ผสานเซลล์',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'เครื่องมือตาราง',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'คุณสมบัติของตาราง',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'คุณสมบัติของเซลล์',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'ประเภทเซลล์',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'เซลล์ข้อมูล',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'เซลล์หัวตาราง',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'ส่วนหัวคอลัมน์',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'ส่วนหัวแถว',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'เส้นขอบ',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'รูปแบบ',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'ความกว้าง',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'ความสูง',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'สี',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'พื้นหลัง',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'การเสริมเต็ม',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'ขนาด',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'การจัดตำแหน่งข้อความของเซลล์ตาราง',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'การจัดแนวตาราง',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'แถบเครื่องมือจัดตำแหน่งข้อความในแนวนอน',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'แถบเครื่องมือจัดตำแหน่งข้อความแนวตั้ง',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'แถบเครื่องมือจัดตำแหน่งตาราง',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'ไม่มี',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'เส้นทึบ',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'เส้นไข่ปลา',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'เส้นประ',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'คู่',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'ร่อง',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'สัน',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'ยุบ',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'นูน',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'จัดตำแหน่งข้อความของเซลล์ชิดซ้าย',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'จัดตำแหน่งข้อความของเซลล์ไว้กึ่งกลาง',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'จัดตำแหน่งข้อความของเซลล์ชิดขวา',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'จัดขอบข้อความของเซลล์ให้กระจายเต็มแนว',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'จัดตำแหน่งข้อความของเซลล์ชิดด้านบน',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'จัดตำแหน่งข้อความของเซลล์ไว้กึ่งกลาง',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'จัดตำแหน่งข้อความของเซลล์ชิดด้านล่าง',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'จัดแนวตารางไปทางซ้ายโดยมีการตัดข้อความ',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'จัดตารางให้อยู่กึ่งกลางโดยไม่มีการตัดข้อความ',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'จัดแนวตารางไปทางขวาพร้อมการตัดข้อความ',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'จัดแนวตารางไปทางซ้ายโดยไม่มีการตัดข้อความ',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'จัดแนวตารางไปทางขวาโดยไม่มีการตัดข้อความ',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'สีไม่ถูกต้อง ลอง "#FF0000" หรือ "rgb(255,0,0)" หรือ "red"',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'ค่าไม่ถูกต้อง ลอง "10px" หรือ "2em" หรือแค่เพียง "2"',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'ป้อนคำบรรยายตาราง',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'แป้นพิมพ์ลัดที่สามารถใช้ได้ในเซลล์ตาราง',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'ย้ายการเลือกไปยังเซลล์ถัดไป',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'ย้ายการเลือกไปยังเซลล์ก่อนหน้า',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'แทรกแถวในตารางใหม่ (เมื่ออยู่ในเซลล์สุดท้ายของตาราง)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'นำทางผ่านตาราง',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'ตาราง',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'รูปแบบตาราง',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'ตารางเค้าโครง',
			// The accessible label of the content table type dropdown button.
			'Content table': 'ตารางเนื้อหา',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'เลือกประเภทตาราง',
			// The accessible label of the table type toolbar button.
			'Table type': 'ประเภทตาราง',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'ตัวเลือกประเภทตาราง'
		}
	}
};

export default translations;
