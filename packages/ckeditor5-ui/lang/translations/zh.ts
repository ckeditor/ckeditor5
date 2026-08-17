/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': '富文本編輯器',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': '編輯區塊',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': '點擊來編輯區塊',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': '拖曳來移動',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': '下一',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': '上一',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': '編輯器工具',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': '下拉選單',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': '下拉式選單',
			// Label of a button that applies a black color in color pickers.
			'Black': '黑色',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': '淡灰色',
			// Label of a button that applies a grey color in color pickers.
			'Grey': '灰色',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': '亮灰色',
			// Label of a button that applies a white color in color pickers.
			'White': '白色',
			// Label of a button that applies a red color in color pickers.
			'Red': '紅色',
			// Label of a button that applies a orange color in color pickers.
			'Orange': '橘色',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': '黃色',
			// Label of a button that applies a light green color in color pickers.
			'Light green': '亮綠色',
			// Label of a button that applies a green color in color pickers.
			'Green': '綠色',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': '淺綠色',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': '藍綠色',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': '亮藍色',
			// Label of a button that applies a blue color in color pickers.
			'Blue': '藍色',
			// Label of a button that applies a purple color in color pickers.
			'Purple': '紫色',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': '編輯器區塊內容工具列',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': '編輯器關聯式工具列',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': '十六進位',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': '找不到結果',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': '沒有可搜尋的項目',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': '編輯工具對話框',
			// The label and the tooltip for the close button in the dialog header.
			'Close': '關閉',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': '協助內容。想關閉此對話框，請按 ESC 鍵。',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': '下方是可在編輯器中使用的鍵盤快捷鍵列表。',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '（可能需要 <kbd>Fn</kbd>）',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': '協助工具',
			// Accessibility help dialog title.
			'Accessibility help': '無障礙協助',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': '按下 %0 來取得協助。',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': '將焦點移入或移出啟用中的對話視窗',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': '檔案',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': '編輯',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': '檢視',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': '插入',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': '格式',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': '工具',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': '說明',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': '文字',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': '字型',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': '編輯器選單列',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': '請輸入有效的顏色（例如「ff0000」）。'
		}
	}
};

export default translations;
