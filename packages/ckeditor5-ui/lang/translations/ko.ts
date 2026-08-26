/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': '서식 있는 텍스트 편집기',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': '편집 영역',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': '클릭하여 블록 편집',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': '드래그하여 이동',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': '다음',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': '이전',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': '편집기 툴바',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': '드롭다운 툴바',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': '드롭다운 메뉴',
			// Label of a button that applies a black color in color pickers.
			'Black': '검은색',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': '진한 회색',
			// Label of a button that applies a grey color in color pickers.
			'Grey': '회색',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': '밝은 회색',
			// Label of a button that applies a white color in color pickers.
			'White': '흰색',
			// Label of a button that applies a red color in color pickers.
			'Red': '빨간색',
			// Label of a button that applies a orange color in color pickers.
			'Orange': '주황색',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': '노랑색',
			// Label of a button that applies a light green color in color pickers.
			'Light green': '연한 초록색',
			// Label of a button that applies a green color in color pickers.
			'Green': '초록색',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': '연한 청록색',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': '청록색',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': '연한 파랑색',
			// Label of a button that applies a blue color in color pickers.
			'Blue': '파랑색',
			// Label of a button that applies a purple color in color pickers.
			'Purple': '보라색',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': '편집기 영역 내용 툴바',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': '편집기 문맥 툴바',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': '결과 찾을 수 없음',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': '검색 가능한 항목 없음',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': '편집기 대화상자',
			// The label and the tooltip for the close button in the dialog header.
			'Close': '닫기',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': '도움말 내용입니다. 이 대화 상자를 닫으려면 ESC 키를 누르세요.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': '편집기에서 사용할 수 있는 키보드 단축키 목록을 아래에서 확인할 수 있습니다.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(<kbd>Fn</kbd> 키가 필요할 수 있음)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': '접근성',
			// Accessibility help dialog title.
			'Accessibility help': '접근성 도움말',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': '도움말을 보려면 %0 키를 누르세요.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': '활성화된 대화 창 안팎으로 포커스 이동',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': '파일',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': '수정',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': '보기',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': '삽입',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': '서식',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': '도구',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': '도움말',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': '텍스트',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': '글꼴',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': '편집기 메뉴 표시줄',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': '유효한 색상을 입력해 주세요(예를 들어, "ff0000").'
		}
	}
};

export default translations;
