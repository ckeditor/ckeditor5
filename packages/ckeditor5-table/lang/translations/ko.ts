/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': '테이블 삽입',
			// Label for the insert table layout toolbar button.
			'Insert table layout': '표 레이아웃 삽입',
			// Label for the set/unset table header column button.
			'Header column': '헤더 열',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': '왼쪽에 열 삽입',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': '오른쪽에 열 삽입',
			// Label for the delete table column button.
			'Delete column': '열 삭제',
			// Label for the select the entire table column button.
			'Select column': '열 선택',
			// Label for the table column dropdown button.
			'Column': '열',
			// Label for the set/unset table header row button.
			'Header row': '헤더 행',
			// Label for the set/unset table footer row button.
			'Footer row': '바닥글 행',
			// Label for the insert row below button.
			'Insert row below': '아래에 행 삽입',
			// Label for the insert row above button.
			'Insert row above': '위에 행 삽입',
			// Label for the delete table row button.
			'Delete row': '행 삭제',
			// Label for the select the entire table row button.
			'Select row': '행 선택',
			// Label for the table row dropdown button.
			'Row': '행',
			// Label for the merge table cell up button.
			'Merge cell up': '위 셀과 병합',
			// Label for the merge table cell right button.
			'Merge cell right': '오른쪽 셀과 병합',
			// Label for the merge table cell down button.
			'Merge cell down': '아래 셀과 병합',
			// Label for the merge table cell left button.
			'Merge cell left': '왼쪽 셀과 병합',
			// Label for the split table cell vertically button.
			'Split cell vertically': '세로로 셀 분할',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': '가로로 셀 분할',
			// Label for the merge table cells button.
			'Merge cells': '셀 병합',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': '표 도구 모음',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': '표 속성',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': '셀 속성',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': '셀 유형',
			// The label for the dropdown option for a data table cell.
			'Data cell': '데이터 셀',
			// The label for the dropdown option for a header table cell.
			'Header cell': '헤더 셀',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': '열 머리글',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': '행 머리글',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': '테두리',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': '스타일',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': '가로',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': '세로',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': '색',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': '배경색',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': '여백',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': '크기',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': '표 셀 텍스트 정렬',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': '표 정렬',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': '가로 텍스트 정렬 도구 모음',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': '세로 텍스트 정렬 도구 모음',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': '표 정렬 도구 모음',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': '선 없음',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': '실선',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': '점선',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': '파선',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': '이중선',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': '음각선',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': '양각선',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': '측면 음각선',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': '측면 양각선',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': '셀 텍스트를 왼쪽으로 정렬',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': '셀 텍스트를 가로 가운데로 정렬',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': '셀 텍스트를 오른쪽으로 정렬',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': '셀 텍스트를 양쪽으로 정렬',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': '셀 텍스트를 위로 정렬',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': '셀 텍스트를 세로 가운데로 정렬',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': '셀 텍스트를 아래로 정렬',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': '표를 왼쪽으로 정렬하고 텍스트 줄 바꿈',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': '표를 중앙 정렬하고 텍스트 줄 바꿈 없음',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': '표를 오른쪽으로 정렬하고 텍스트 줄 바꿈',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': '표를 왼쪽으로 정렬하고 텍스트 줄 바꿈 없음',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': '표를 오른쪽으로 정렬하고 텍스트 줄 바꿈 없음',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': '유효하지 않은 색입니다. "#FF0000"이나 "rgb(255,0,0)", 또는 "red"를 입력해 보세요.',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': '유효하지 않은 값입니다. "10px"나 "2em" 또는 그냥 "2"를 입력해 보세요.',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': '테이블 캡션 입력',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': '표 셀에서 사용할 수 있는 키 입력',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': '선택 항목을 다음 셀로 이동',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': '선택 항목을 이전 셀로 이동',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': '새 표 행 삽입(표의 마지막 셀에 있을 때)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': '표 탐색',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': '표',
			// The accessible label used in the table layout insert UI element.
			'Table layout': '표 레이아웃',
			// The accessible label of the layout table type dropdown button.
			'Layout table': '레이아웃 표',
			// The accessible label of the content table type dropdown button.
			'Content table': '콘텐츠 표',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': '표 유형 선택',
			// The accessible label of the table type toolbar button.
			'Table type': '표 유형',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': '표 유형 옵션'
		}
	}
};

export default translations;
