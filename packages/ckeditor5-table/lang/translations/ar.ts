/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ar': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'إدراج جدول',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'إدراج تخطيط الجدول',
			// Label for the set/unset table header column button.
			'Header column': 'عمود عنوان',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'أدخل العمود إلى اليسار',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'أدخل العمود إلى اليمين',
			// Label for the delete table column button.
			'Delete column': 'حذف العمود',
			// Label for the select the entire table column button.
			'Select column': 'حدد العمود',
			// Label for the table column dropdown button.
			'Column': 'عمود',
			// Label for the set/unset table header row button.
			'Header row': 'صف عنوان',
			// Label for the set/unset table footer row button.
			'Footer row': 'صف التذييل',
			// Label for the insert row below button.
			'Insert row below': 'ادراج صف بعد',
			// Label for the insert row above button.
			'Insert row above': 'ادراج صف قبل',
			// Label for the delete table row button.
			'Delete row': 'حذف الصف',
			// Label for the select the entire table row button.
			'Select row': 'حدد صفًا',
			// Label for the table row dropdown button.
			'Row': 'صف',
			// Label for the merge table cell up button.
			'Merge cell up': 'دمج الخلايا للأعلى',
			// Label for the merge table cell right button.
			'Merge cell right': 'دمج الخلايا لليمين',
			// Label for the merge table cell down button.
			'Merge cell down': 'دمج الخلايا للأسفل',
			// Label for the merge table cell left button.
			'Merge cell left': 'دمج الخلايا لليسار',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'فصل الخلايا بشكل عمودي',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'فصل الخلايا بشكل افقي',
			// Label for the merge table cells button.
			'Merge cells': 'دمج الخلايا',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'شريط أدوات الجدول',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'خصائص الجدول',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'خصائص الخلية',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'نوع الخلية',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'خلية البيانات',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'خلية العنوان',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'عنوان العمود',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'عنوان الصف',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'الحدود',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'أسلوب',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'العرض',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'الارتفاع',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'اللون',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'الخلفية',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'الحاشية',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'الابعاد',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'محاذاة نص خلية الجدول',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'محاذاة الجدول',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'شريط أدوات محاذاة النص الأفقي',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'شريط أدوات محاذاة النص العمودي',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'شريط أدوات محاذاة الجدول',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'لا شيء',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'صلب',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'منقط',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'متقطع',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'مزدوج',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'إطار محفور',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'إطار ناتئ',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'منخفض',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'بارز',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'قم بمحاذاة نص الخلية إلى اليسار',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'قم بمحاذاة نص الخلية إلى المركز',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'قم بمحاذاة نص الخلية إلى اليمين',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'ضبط نص الخلية',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'قم بمحاذاة نص الخلية إلى الأعلى',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'قم بمحاذاة نص الخلية إلى المنتصف',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'قم بمحاذاة نص الخلية للاسفل',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'محاذاة الجدول إلى اليسار مع التفاف النص',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'توسيط الجدول دون التفاف النص',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'محاذاة الجدول إلى اليمين مع التفاف النص',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'محاذاة الجدول إلى اليسار دون التفاف النص',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'محاذاة الجدول إلى اليمين دون التفاف النص',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'هذا اللون غير صالح. جرِّب "#FF0000" أو "rgb(255,0,0)" أو "أحمر".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'هذه القيمة غير صالحة. جرِّب "10px" أو "2em" أو "2" وحسب.',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'أدخل التسمية التوضيحية للجدول',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'ضغطة المفاتيح التي يمكن استخدامها في خلية الجدول',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'انقلْ التحديد إلى الخلية التالية',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'انقلْ التحديد إلى الخلية السابقة',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'قمْ بإدراج صف جدول جديد (في آخر خلية من الجدول)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'تنقّلْ عبر الجدول',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'جدول',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'تخطيط الجدول',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'جدول التخطيط',
			// The accessible label of the content table type dropdown button.
			'Content table': 'جدول المحتويات',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'اختر نوع الجدول',
			// The accessible label of the table type toolbar button.
			'Table type': 'نوع الجدول',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'خيارات نوع الجدول'
		}
	}
};

export default translations;
