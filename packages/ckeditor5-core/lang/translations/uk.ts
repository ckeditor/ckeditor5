/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'uk': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Відміна',
			// Label for the Clear button.
			'Clear': 'Очистити',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Видалити колір',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Відновити за замовчуванням',
			// Label for the Save button.
			'Save': 'Зберегти',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Показати більше',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 із %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Неможливо завантажити файл:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Редактор Rich Text. Область редагування: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Вставити за допомогою файлового менеджера',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Замінити за допомогою файлового менеджера',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Вставити зображення за допомогою файлового менеджера',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Замінити зображення за допомогою файлового менеджера',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Файл',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Менеджер файлів',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Вимкнути підпис',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Увімкнути підпис',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Натискання клавіш для редагування вмісту',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Ці комбінації клавіш забезпечують швидкий доступ до функцій редагування вмісту.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Інтерфейс користувача та клавіші навігації вмістом',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Використовуйте наведені нижче комбінації клавіш для більш ефективної навігації в інтерфейсі користувача CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Закрити контекстні виноски, спадні списки та діалогові вікна',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Відкрийте діалогове вікно довідки для доступності',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Переміщення фокуса між полями форми (введення, кнопки тощо)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Перемістіть фокус на рядок меню, переміщуйтесь між рядками меню',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Переміщення фокуса на панель інструментів, навігація між панелями інструментів',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Переміщуйтесь панеллю інструментів або рядком меню',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Активуйте кнопку, на якій знаходиться фокус. Активація кнопок, які взаємодіють з редакторським контентом переміщує фокус назад на контент.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Прийняти',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Вихідний код',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Параграф',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Вибір кольору',
			// Label for the Insert button.
			'Insert': 'Вставити',
			// Label for the Update button.
			'Update': 'Оновити',
			// Label for the Back button.
			'Back': 'Назад',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Будь ласка, спробуйте іншу фразу або перевірте написання.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Обернути текст',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Розірвати тексту',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Власний',
			// The default label for the resize option that resets the size.
			'Original': 'Оригінал',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Значення не може бути порожнім.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Значення має виражатись простим числом.'
		},
		getPluralForm: ( n: number ) => (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	}
};

export default translations;
