/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': '小部件工具栏',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': '在前面插入段落',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': '在后面插入段落',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': '按下“Enter”键，在小组件后输入；按下“Shift+Enter”键，在小组件前输入',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': '当小组件被选中时（例如：图片、表格等）可以使用的按键',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': '直接在小组件之后插入新段落',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': '直接在小组件之前插入新段落',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': '移动插入符，以允许在小组件之前直接输入文字',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': '移动插入符，以允许在小组件之后直接输入文字',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': '将焦点从可编辑区域移回父窗口小组件'
		}
	}
};

export default translations;
