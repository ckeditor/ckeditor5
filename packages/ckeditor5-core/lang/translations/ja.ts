/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ja': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'キャンセル',
			// Label for the Clear button.
			'Clear': '消去',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'カラーを削除',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': '初期値に戻す',
			// Label for the Save button.
			'Save': '保存',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': '他の項目を表示',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0/%1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'ファイルをアップロードできません:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'リッチテキストエディタ。編集エリア：%0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'ファイルマネージャで挿入',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'ファイルマネージャで置換',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'ファイルマネージャで画像を挿入',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'ファイルマネージャで画像を置換',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'ファイル',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'ファイルマネージャー付き',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'キャプションをオフにする',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'キャプションをオンにする',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'コンテンツ編集のキーストローク',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'これらのキーボードショートカットを使用すると、コンテンツ編集機能に速やかにアクセスできます。',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'ユーザーインターフェースとコンテンツナビゲーションのキーストローク',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': '以下のキーストロークを使用すると、CKEditor 5ユーザーインターフェースをより効率的に操作できます。',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'コンテキストバルーン、ドロップダウンメニュー、ダイアログを閉じる',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'アクセシビリティに関するヘルプのダイアログを開く',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'フォーカスをフォームフィールド（入力欄、ボタンなど）間で移動させる',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'フォーカスをメニューバーに移し、メニューバー間で移動',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'フォーカスをツールバーへ移動させて、ツールバーを操作する',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'ツールバーまたはメニューバー内を移動',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': '現在フォーカスしているボタンを実行。エディターコンテンツに作用するボタンを実行するとフォーカスはコンテンツに戻ります。',
			// Label of the button confirming the changes done in the current interface.
			'Accept': '同意します',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'ソース',
			// Dropdown option label for the paragraph format.
			'Paragraph': '段落',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'カラーピッカー',
			// Label for the Insert button.
			'Insert': 'インサート',
			// Label for the Update button.
			'Update': 'アップデート',
			// Label for the Back button.
			'Back': '戻る',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': '別のフレーズを試すかスペルを確認してください。',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'テキストを折り返す',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'テキストを分割する',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'カスタム',
			// The default label for the resize option that resets the size.
			'Original': 'オリジナル',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'この値は空白にできません。',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'この値は単純な数字にする必要があります。'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
