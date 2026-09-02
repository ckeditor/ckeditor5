/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bn': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'টেবিল ঢোকান',
			// Label for the insert table layout toolbar button.
			'Insert table layout': '**টেবিল লেআউট যুক্ত করুন**',
			// Label for the set/unset table header column button.
			'Header column': 'হেডার কলাম',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'বাম দিকে কলাম ঢোকান',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'ডানদিকে কলাম ঢোকান',
			// Label for the delete table column button.
			'Delete column': 'কলাম মুছে ফেলুন',
			// Label for the select the entire table column button.
			'Select column': 'কলাম নির্বাচন করুন',
			// Label for the table column dropdown button.
			'Column': 'কলাম',
			// Label for the set/unset table header row button.
			'Header row': 'হেডার সারি',
			// Label for the set/unset table footer row button.
			'Footer row': 'ফুটার সারি',
			// Label for the insert row below button.
			'Insert row below': 'নীচে সারি ঢোকান',
			// Label for the insert row above button.
			'Insert row above': 'উপরে সারি ঢোকান',
			// Label for the delete table row button.
			'Delete row': 'সারি মুছুন',
			// Label for the select the entire table row button.
			'Select row': 'সারি নির্বাচন করুন',
			// Label for the table row dropdown button.
			'Row': 'সারি ',
			// Label for the merge table cell up button.
			'Merge cell up': 'সেল আপ মার্জ',
			// Label for the merge table cell right button.
			'Merge cell right': ' ডানদিকে সেল মার্জ করুন',
			// Label for the merge table cell down button.
			'Merge cell down': 'নিচে সেল মার্জ করুন',
			// Label for the merge table cell left button.
			'Merge cell left': 'বামদিকে সেল মার্জ করুন',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'সেল উল্লম্বভাবে বিভক্ত করুন',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'অনুভূমিকভাবে সেল বিভক্ত করুন',
			// Label for the merge table cells button.
			'Merge cells': 'সেল একত্রিত করুন',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'টেবিল টুলবার',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'টেবিল বৈশিষ্ট্য',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'সেল বৈশিষ্ট্য',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'সেলের ধরন',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'ডেটা সেল',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'হেডার সেল',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'কলাম শিরোনাম',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'সারি শিরোনাম',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'বর্ডার ',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'স্টাইল ',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'প্রস্থ',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'উচ্চতা',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': '  রং',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'ব্যাকগ্রাউন্ড',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'প্যাডিং',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'মাত্রাগুলো',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'সক্ষম সেল টেক্সট সারিবদ্ধকরণ',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'টেবিল সমন্বয়',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'অনুভূমিক টেক্সট সারিবদ্ধকরণ টুলবার',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'উল্লম্ব টেক্সট সারিবদ্ধকরণ টুলবার',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'টেবিল সারিবদ্ধকরণ টুলবার',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'কোনোটিই নয়',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'সলিড',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'ডটেড',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'ড্যাশড',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'দ্বিগুণ',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'খাঁজকাটা',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'রিজ',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'ইনসেট',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'শুরু',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'বাম দিকে সেল টেক্সট সারিবদ্ধ করুন',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'কেন্দ্রে সেল টেক্সট সারিবদ্ধ করুন',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'ডানদিকে সেল টেক্সট সারিবদ্ধ করুন ',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'সেল টেক্সট জাস্টিফাই করুন',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'শীর্ষে সেল টেক্সট সারিবদ্ধ করুন',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'মাঝখানে সেল টেক্সট সারিবদ্ধ করুন',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'নীচে সেল টেক্সট সারিবদ্ধ করুন',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'টেক্সট র‍্যাপিংসহ টেবিল বাম দিকে সমন্বয় করুন',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'টেক্সট র‍্যাপিং ছাড়া টেবিল কেন্দ্রে সমন্বয় করুন',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'টেক্সট র‍্যাপিংসহ টেবিল ডান দিকে সমন্বয় করুন',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'টেক্সট র‍্যাপিং ছাড়া টেবিল বাম দিকে সমন্বয় করুন',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'টেক্সট র‍্যাপিং ছাড়া টেবিল ডান দিকে সমন্বয় করুন',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'রংটি সঠিক নয়। "#FF0000" অথবা "rgb(255,0,0)" অথবা "লাল" ব্যাবহার করুন।\n',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'মানটি সঠিক নয়। "10px" বা "2em" বা সহজভাবে "2" ব্যবহার করে দেখুন।',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'টেবিল ক্যাপশন লিখুন',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'যে কীস্ট্রোকগুলি টেবিল সেলে ব্যবহার করা যেতে পারে',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'পরবর্তী সেলে সিলেকশন স্থানান্তর করুন',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'পূর্ববর্তী সেলে সিলেকশন স্থানান্তর করুন',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'একটি নতুন টেবিলের সারি প্রবেশ করুন (কোনো টেবিলের শেষ সেলে থাকা অবস্থায়)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'টেবিলের মধ্যে দিয়ে নেভিগেট করুন',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'টেবিল',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'টেবিল লেআউট',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'লেআউট টেবিল',
			// The accessible label of the content table type dropdown button.
			'Content table': 'কনটেন্ট টেবিল',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'টেবিল টাইপ নির্বাচন করুন',
			// The accessible label of the table type toolbar button.
			'Table type': 'টেবিল টাইপ',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'টেবিল টাইপ অপশনসমূহ'
		}
	}
};

export default translations;
