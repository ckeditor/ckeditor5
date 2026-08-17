/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ja': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': '表の挿入',
			// Label for the insert table layout toolbar button.
			'Insert table layout': '表のレイアウトを挿入',
			// Label for the set/unset table header column button.
			'Header column': '見出し列',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': '左に列を挿入',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': '右に列を挿入',
			// Label for the delete table column button.
			'Delete column': '列を削除',
			// Label for the select the entire table column button.
			'Select column': '列を選択',
			// Label for the table column dropdown button.
			'Column': '列',
			// Label for the set/unset table header row button.
			'Header row': '見出し行',
			// Label for the set/unset table footer row button.
			'Footer row': 'フッター行',
			// Label for the insert row below button.
			'Insert row below': '下に行を挿入',
			// Label for the insert row above button.
			'Insert row above': '上に行を挿入',
			// Label for the delete table row button.
			'Delete row': '行を削除',
			// Label for the select the entire table row button.
			'Select row': '行を選択',
			// Label for the table row dropdown button.
			'Row': '行',
			// Label for the merge table cell up button.
			'Merge cell up': '上のセルと結合',
			// Label for the merge table cell right button.
			'Merge cell right': '右のセルと結合',
			// Label for the merge table cell down button.
			'Merge cell down': '下のセルと結合',
			// Label for the merge table cell left button.
			'Merge cell left': '左のセルと結合',
			// Label for the split table cell vertically button.
			'Split cell vertically': '横にセルを分離',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': '縦にセルを分離',
			// Label for the merge table cells button.
			'Merge cells': 'セルを結合',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'テーブルのツールバー',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'テーブルのプロパティ',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'セルのプロパティ',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'セルの種類',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'データセル',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'ヘッダーセル',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': '列ヘッダー',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': '行ヘッダー',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': '罫線',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'スタイル',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': '幅',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': '高さ',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': '色',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': '背景',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'パディング',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': '寸法',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'テーブルセルのテキスト配置',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': '表の配置',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': '水平方向のテキスト配置ツールバー',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': '垂直方向のテキスト配置ツールバー',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'テーブル配置ツールバー',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'なし',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': '1本線',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': '点線',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': '破線',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': '2本線',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': '立体的にくぼんだ線',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': '立体的に隆起した線',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': '内側全体がくぼんだ線',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': '内側全体が隆起した線',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'セルのテキストを左へ寄せる',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'セルのテキストを中央へ揃える',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'セルのテキストを右へ寄せる',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'セルのテキストを両端へ揃える',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'セルのテキストを上に寄せる',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'セルのテキストを中央へ揃える',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'セルのテキストを下に寄せる',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': '表を左揃え（テキストの折り返しあり）',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': '表を中央揃え（テキストの折り返しなし）',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': '表を右揃え（テキストの折り返しあり）',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': '表を左揃え（テキストの折り返しなし）',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': '表を右揃え（テキストの折り返しなし）',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'この色は無効です。「#FF0000」、「rgb（255,0,0」または「赤」をお試しください。',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'この値は無効です。「10px」、「2em」または単純に「2」をお試しください。',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'テーブルキャプションを入力',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'テーブルセルで使用できるキーストローク',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': '選択範囲を次のセルに移動させる',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': '選択範囲を前のセルに移動させる',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': '新しいテーブル行を挿入する（テーブルの最終セルにある場合）',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'テーブル内を移動する',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'テーブル',
			// The accessible label used in the table layout insert UI element.
			'Table layout': '表のレイアウト',
			// The accessible label of the layout table type dropdown button.
			'Layout table': '表のレイアウト',
			// The accessible label of the content table type dropdown button.
			'Content table': 'コンテンツ表',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': '表の種類を選択',
			// The accessible label of the table type toolbar button.
			'Table type': '表の種類',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': '表の種類のオプション'
		}
	}
};

export default translations;
