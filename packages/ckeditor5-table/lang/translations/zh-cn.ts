/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': '插入表格',
			// Label for the insert table layout toolbar button.
			'Insert table layout': '插入表格布局',
			// Label for the set/unset table header column button.
			'Header column': '标题列',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': '左侧插入列',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': '右侧插入列',
			// Label for the delete table column button.
			'Delete column': '删除本列',
			// Label for the select the entire table column button.
			'Select column': '选择列',
			// Label for the table column dropdown button.
			'Column': '列',
			// Label for the set/unset table header row button.
			'Header row': '标题行',
			// Label for the set/unset table footer row button.
			'Footer row': '脚注行',
			// Label for the insert row below button.
			'Insert row below': '在下面插入一行',
			// Label for the insert row above button.
			'Insert row above': '在上面插入一行',
			// Label for the delete table row button.
			'Delete row': '删除本行',
			// Label for the select the entire table row button.
			'Select row': '选择行',
			// Label for the table row dropdown button.
			'Row': '行',
			// Label for the merge table cell up button.
			'Merge cell up': '向上合并单元格',
			// Label for the merge table cell right button.
			'Merge cell right': '向右合并单元格',
			// Label for the merge table cell down button.
			'Merge cell down': '向下合并单元格',
			// Label for the merge table cell left button.
			'Merge cell left': '向左合并单元格',
			// Label for the split table cell vertically button.
			'Split cell vertically': '纵向拆分单元格',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': '横向拆分单元格',
			// Label for the merge table cells button.
			'Merge cells': '合并单元格',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': '表格工具栏',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': '表格属性',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': '单元格属性',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': '单元格类型',
			// The label for the dropdown option for a data table cell.
			'Data cell': '数据单元格',
			// The label for the dropdown option for a header table cell.
			'Header cell': '表头单元格',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': '列标题',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': '行标题',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': '边框',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': '样式',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': '宽度',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': '高度',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': '颜色',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': '背景',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': '内边距',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': '尺寸',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': '表格单元格中的文本水平对齐',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': '表格对齐方式',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': '水平文本对齐工具栏',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': '垂直文本对齐工具栏',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': '表格对齐工具栏',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': '无',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': '实线',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': '点状虚线',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': '虚线',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': '双线',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': '凹槽边框',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': '垄状边框',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': '凹边框',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': '凸边框',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': '使单元格文本左对齐',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': '使单元格文本水平居中',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': '使单元格文本右对齐',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': '对齐单元格文本',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': '使单元格文本对齐到顶部',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': '使单元格文本垂直居中',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': '使单元格文本对齐到底部',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': '表格左对齐，文字环绕',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': '表格居中，无文字环绕',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': '表格右对齐，文字环绕',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': '表格左对齐，无文字环绕',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': '表格右对齐，无文字环绕',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': '颜色无效。尝试使用"#FF0000"、"rgb(255,0,0)"或者"red"。',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': '无效值。尝试使用“10px”、“2ex”或者只写“2”。',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': '输入表标题',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': '可在表格单元格中使用的按键',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': '将所选内容移动到下一个单元格',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': '将所选内容移至上一个单元格',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': '插入新的表格行（当位于表格的最后一个单元格时）',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': '在表格中进行导览',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': '表格',
			// The accessible label used in the table layout insert UI element.
			'Table layout': '表格布局',
			// The accessible label of the layout table type dropdown button.
			'Layout table': '布局表格',
			// The accessible label of the content table type dropdown button.
			'Content table': '内容表格',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': '选择表格类型',
			// The accessible label of the table type toolbar button.
			'Table type': '表格类型',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': '表格类型选项'
		}
	}
};

export default translations;
