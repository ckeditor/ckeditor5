/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Панель инструментов виджета',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Вставить параграф перед блоком',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Вставить параграф после блока',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Нажмите Enter для ввода текста после виджета или нажмите Shift + Enter для ввода текста перед виджетом',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Нажатия клавиш, которые можно использовать при выборе виджета (например: изображение, таблица и т. д.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Вставить новый абзац непосредственно после виджета.',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Вставить новый абзац непосредственно перед виджетом.',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Переместите курсор, чтобы можно было вводить текст непосредственно перед виджетом.',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Переместить курсор, чтобы можно было вводить текст сразу после виджета.',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Переместите фокус с редактируемой области обратно на родительский виджет'
		}
	}
};

export default translations;
