/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Thanh công cụ tiện ích',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Chèn đoạn trước khối',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Chèn đoạn sau khối',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Nhấn Enter để nhập vào sau hoặc nhấn Shift + Enter để nhập vào trước tiện ích',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Tổ hợp phím mà bạn có thể dùng khi một tiện ích được chọn (ví dụ: hình ảnh, bảng, v.v.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Chèn đoạn văn mới ngay sau tiện ích',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Chèn đoạn văn mới ngay trước tiện ích',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Di chuyển dấu sót để cho phép nhập ngay trước một tiện ích',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Di chuyển dấu sót để cho phép nhập ngay sau một tiện ích',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Di chuyển tiêu điểm từ vùng có thể chỉnh sửa trở lại tiện ích gốc'
		}
	}
};

export default translations;
