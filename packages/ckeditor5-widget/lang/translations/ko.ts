/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': '위젯 툴바',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': '블록 앞에 단락 삽입',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': '블록 뒤에 단락 삽입',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': '엔터를 눌러서 위젯 뒤에 입력하거나 시프트 + 엔터를 눌러서 위젯 앞에 입력하세요',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': '위젯이 선택되었을 때 사용할 수 있는 키 입력(예: 이미지, 표 등)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': '위젯 바로 뒤에 새 단락 삽입',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': '위젯 바로 앞에 새 단락 삽입',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': '위젯 바로 앞에 입력할 수 있도록 삽입 기호 이동',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': '위젯 바로 뒤에 입력할 수 있도록 삽입 기호 이동',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': '포커스를 편집 가능 영역에서 부모위젯으로 옮기기'
		}
	}
};

export default translations;
