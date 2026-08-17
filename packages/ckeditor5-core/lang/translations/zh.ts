/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': '取消',
			// Label for the Clear button.
			'Clear': '清除',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': '移除顏色',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': '重設至預設值',
			// Label for the Save button.
			'Save': '儲存',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': '顯示更多',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0/%1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': '無法上傳檔案：',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'RTF 編輯器。編輯區：%0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': '使用檔案管理員插入',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': '使用檔案管理員替換',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': '使用檔案管理員插入圖片',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': '使用檔案管理員替換圖片',
			// The label for a button that opens a file manager in order to insert a file.
			'File': '檔案',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': '使用檔案管理員',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': '關閉表標題',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': '開啟表標題',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': '內容編輯按鍵',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': '運用這些鍵盤快捷鍵可快速使用內容編輯功能。',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': '使用者介面和內容瀏覽按鍵',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': '使用以下按鍵可更有效率地在 CKEditor 5 使用者介面中移動。',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': '關閉選單提示、下拉式選單和對話框',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': '開啟無障礙協助對話框',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': '在表單欄位（輸入、按鈕等）之間移動焦點',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': '將焦點移至選單列，瀏覽不同的選單列',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': '將焦點移動至工具列，在工具列間移動',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': '瀏覽工具列或選單列',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': '執行目前所聚焦的按鈕。執行與編輯器內容互動的按鈕後，系統會將焦點移回內容。',
			// Label of the button confirming the changes done in the current interface.
			'Accept': '接受',
			// The label of the source editing related features used in toolbar buttons.
			'Source': '原始碼',
			// Dropdown option label for the paragraph format.
			'Paragraph': '段落',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': '顏色選擇',
			// Label for the Insert button.
			'Insert': '插入',
			// Label for the Update button.
			'Update': '更新',
			// Label for the Back button.
			'Back': '返回',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': '請嘗試其他詞彙或確認拼寫是否正確。',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': '文繞圖',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': '上及下',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': '自訂',
			// The default label for the resize option that resets the size.
			'Original': '原始圖片',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': '數值不得為空白。',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': '數值應為純數字。'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
