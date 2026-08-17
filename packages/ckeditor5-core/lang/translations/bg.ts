/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bg': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Отказ',
			// Label for the Clear button.
			'Clear': 'Изчисти',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Премахни цвят',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Възстанови първоначалните настройки',
			// Label for the Save button.
			'Save': 'Запазване',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Покажи повече единици',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 от %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Не може да качи файл:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rich Text Editor. Зона за редактиране: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Вмъкване с файловия мениджър',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Заменете с файловия мениджър',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Вмъкнете изображение с файловия мениджър',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Заменете изображението с файловия мениджър',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Файл',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'С файлов мениджър',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Превключи изключване на надписи',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Превключи включване на надписи',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Клавишни комбинации за редактиране на съдържание',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Тези клавишни комбинации позволяват бърз достъп до елементите за редактиране на съдържание',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Потребителски интерфейс и клавишни комбинации за навигация в съдържанието',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Използвайте следните клавишни комбинации за по -лесна навигация в потребителския интерфейс на CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Затваряне на балоните с контекст, падащите менюта и диалогови прозорци',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Отваряне на диалогов прозорец с помощ за достъпност',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Преместване на фокуса между полетата (въвеждане, бутони и др.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Преместете фокуса върху лентата с менюта, навигирайте между лентите с менюта',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Преместване на фокуса върху лентата с инструменти, навигация между инструментите',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Навигирайте през лентата с инструменти или лентата с менюта',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Изпълнете текущо фокусирания бутон. Изпълнението на бутони, които взаимодействат със съдържанието на редактора, премества фокуса обратно към съдържанието.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Приемане',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Източник',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Параграф',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Избор на цвят',
			// Label for the Insert button.
			'Insert': 'Вмъкни',
			// Label for the Update button.
			'Update': 'Обнови',
			// Label for the Back button.
			'Back': 'Назад',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Моля, опитайте с друг израз или проверете правописа.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Събери текст',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Раздели текст',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Потребителски',
			// The default label for the resize option that resets the size.
			'Original': 'Оригинал',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Стойността не трябва да е празна.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Стойността трябва да бъде просто число.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
