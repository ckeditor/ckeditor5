/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Отмена',
			// Label for the Clear button.
			'Clear': 'Очистить',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Убрать цвет',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'По умолчанию',
			// Label for the Save button.
			'Save': 'Сохранить',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Другие инструменты',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 из %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Невозможно загрузить файл',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Редактор форматированного текста. Область редактирования: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Вставка с помощью файлового менеджера',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Заменить с помощью файлового менеджера',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Вставить изображение с помощью файлового менеджера',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Заменить изображение с помощью файлового менеджера',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Файл',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Из менеджера файлов',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Выключить описание',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Включить описание',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Клавиши для редактирования контента',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Эти сочетания клавиш обеспечивают быстрый доступ к функциям редактирования контента.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Пользовательский интерфейс и клавиши навигации по контенту',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Использовать следующие сочетания клавиш для более эффективной навигации в пользовательском интерфейсе CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Закрыть контекстные всплывающие окна, раскрывающиеся списки и диалоговые окна.',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Открыть диалоговое окно справки по специальным возможностям',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Переместить фокус между полями формы (вводы, кнопки и т. д.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Переместить фокус на панель меню, перемещаться между панелями меню',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Переместить фокус на панель инструментов, перемещаться между панелями инструментов',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Перемещение по панели инструментов или панели меню',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Активировать кнопку, находящуюся в фокусе. Активирование кнопок, которые взаимодействуют с содержимым редактора, перемещает фокус обратно на содержимое.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Принять',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Источник',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Параграф',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Выбор цвета',
			// Label for the Insert button.
			'Insert': 'Вставить',
			// Label for the Update button.
			'Update': 'Обновить',
			// Label for the Back button.
			'Back': 'Назад',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Пожалуйста, попробуйте другую фразу или проверьте правописание.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Обтекать текст',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Разрывать текст',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Другое',
			// The default label for the resize option that resets the size.
			'Original': 'Оригинальный',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Значение не должно быть пустым.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Значение должно быть простым числом.'
		},
		getPluralForm: ( n: number ) => (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	}
};

export default translations;
