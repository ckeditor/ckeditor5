/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'he': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'הכנס טבלה',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'הוסף פריסת טבלה',
			// Label for the set/unset table header column button.
			'Header column': 'עמודת כותרת',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'הכנסת עמודה משמאל',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'הכנסת עמודה מימן',
			// Label for the delete table column button.
			'Delete column': 'מחיקת עמודה',
			// Label for the select the entire table column button.
			'Select column': 'בחירת עמודה',
			// Label for the table column dropdown button.
			'Column': 'עמודה',
			// Label for the set/unset table header row button.
			'Header row': 'שורת כותרת',
			// Label for the set/unset table footer row button.
			'Footer row': 'שורת כותרת תחתונה',
			// Label for the insert row below button.
			'Insert row below': 'הכנה שורה מתחת',
			// Label for the insert row above button.
			'Insert row above': 'הכנסת שורה מעל',
			// Label for the delete table row button.
			'Delete row': 'מחיקת שורה',
			// Label for the select the entire table row button.
			'Select row': 'בחירת שורה',
			// Label for the table row dropdown button.
			'Row': 'שורה',
			// Label for the merge table cell up button.
			'Merge cell up': 'מיזוג תא למעלה',
			// Label for the merge table cell right button.
			'Merge cell right': 'מיזוג תא ימינה',
			// Label for the merge table cell down button.
			'Merge cell down': 'מיזוג תא למטה',
			// Label for the merge table cell left button.
			'Merge cell left': 'מיזוג תא שמאלה',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'פיצול תא אנכית',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'פיצול תא אופקית',
			// Label for the merge table cells button.
			'Merge cells': 'מיזוג תאים',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'סרגל כלים של טבלה',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'אפשרויות טבלה',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'אפשרויות תא',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'סוג תא',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'תא נתונים',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'תא כותרת',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'כותרת עמודה',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'כותרת שורה',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'גבול',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'עיצוב',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'רוחב',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'גובה',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'צבע',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'רקע',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'מרווח',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'ממדים',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'יישור טקסט של תא טבלה',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'יישור טבלה',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'סרגל כלים של יישור טקסט אופקי',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'סרגל כלים של יישור טקסט אנכי',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'סרגל כלים של יישור טבלה',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'ללא',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'אחיד',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'מנוקד',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'מקווקו',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'כפול',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Groove',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Ridge',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'פנימי',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'חיצוני',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'יישר את טקסט התא לשמאל',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'יישר את טקסט התא למרכז',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'יישר את טקסט התא לימין',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'יישר את טקסט התא לשני הצדדים',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'יישר את טקסט התא לחלק העליון',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'יישר את טקסט התא לאמצע',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'יישר את טקסט התא לחלק התחתון',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'יישור טבלה לשמאל עם גלישת טקסט',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'מרכוז טבלה ללא גלישת טקסט',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'יישור טבלה לימין עם גלישת טקסט',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'יישור טבלה לשמאל ללא גלישת טקסט',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'יישור טבלה לימין ללא גלישת טקסט',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'הצבע לא חוקי. נסו "#FF0000" או "rgb(255,0,0)" או "אדום".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'הערך לא חוקי. נסו "10px" או "2em" או פשוט "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'הזינו כיתוב טבלה',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'מקשים בהם ניתן להשתמש בתא בטבלה',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'העברת הבחירה לתא הבא',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'העברת הבחירה לתא הקודם',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'הוספת שורה חדשה לטבלה (כאשר בתא האחרון של טבלה)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'ניווט בטבלה',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'טבלה',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'פריסת טבלה',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'טבלת פריסה',
			// The accessible label of the content table type dropdown button.
			'Content table': 'טבלת תוכן',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'בחר סוג טבלה',
			// The accessible label of the table type toolbar button.
			'Table type': 'סוג טבלה',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'אפשרויות סוג טבלה'
		}
	}
};

export default translations;
