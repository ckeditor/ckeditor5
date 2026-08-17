/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': '小工具',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': '在這個區塊前面插入一個段落',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': '在這個區塊後面插入一個段落',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': '按下 Enter 在小工具後輸入，或按下 Shift + Enter 在小工具前輸入',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': '小工具選取時可使用的按鍵（例如：圖片、表格等）',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': '在小工具後直接插入新段落',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': '在小工具前直接插入新段落',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': '移動插入符號，以便在小工具前直接輸入',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': '移動插入符號，以便在小工具後直接輸入',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': '將焦點從可編輯區域移回上層小工具'
		}
	}
};

export default translations;
