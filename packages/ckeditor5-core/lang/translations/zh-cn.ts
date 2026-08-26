/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': '取消',
			// Label for the Clear button.
			'Clear': '清除',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': '移除颜色',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': '恢复默认',
			// Label for the Save button.
			'Save': '保存',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': '显示更多',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '第 %0 步，共 %1 步',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': '无法上传的文件：',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': '富文本编辑器。编辑区域：%0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': '使用文件管理器插入',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': '使用文件管理器替换',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': '使用文件管理器插入图片',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': '使用文件管理器替换图片',
			// The label for a button that opens a file manager in order to insert a file.
			'File': '文件',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': '通过文件管理器',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': '关闭表标题',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': '打开表标题',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': '内容编辑按键',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': '这些键盘快捷键允许快速访问内容编辑功能。',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': '用户界面和内容导航按键',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': '使用以下按键可以在 CKEditor 5 用户界面中进行更有效地导览。',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': '关闭上下文气泡框、下拉菜单和对话框',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': '打开“无障碍辅助功能帮助”对话框',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': '在表单字段（输入、按钮等）之间移动焦点',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': '将焦点移到菜单栏，在菜单栏之间导航',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': '将焦点移至工具栏，在工具栏之间导览',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': '通过工具栏或菜单栏进行导航',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': '执行当前聚焦的按钮。执行与编辑器内容交互的按钮将焦点返回到内容。',
			// Label of the button confirming the changes done in the current interface.
			'Accept': '接受',
			// The label of the source editing related features used in toolbar buttons.
			'Source': '源',
			// Dropdown option label for the paragraph format.
			'Paragraph': '段落',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': '颜色选择器',
			// Label for the Insert button.
			'Insert': '插入',
			// Label for the Update button.
			'Update': '更新',
			// Label for the Back button.
			'Back': '返回',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': '请尝试使用不同的短语或检查拼写。',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': '文字环绕',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': '文字断行',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': '自定义',
			// The default label for the resize option that resets the size.
			'Original': '原始大小',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': '该值不能为空。',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': '该值应当为纯数字。'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
