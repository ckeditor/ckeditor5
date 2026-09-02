/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'be': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Адмяніць',
			// Label for the Clear button.
			'Clear': 'Ачысціць',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Выдаліць колер',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Выстаўць па змаўчанні',
			// Label for the Save button.
			'Save': 'Захаваць',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Паказаць больш інструментаў',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 з %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Немагчыма загрузіць файл:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Рэдактар форматыраванага тэксту. Вобласць рэдагавання: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Уставіць з файлавым менеджэрам',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Замяніць з файлавым менеджэрам',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Уставіць выявы з файлавым менеджэрам',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Замяніць выявы з файлавым менеджэрам',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Файл',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'З файлавага менеджэра',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Выключыць апісанне',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Уключыць апісанне',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Клавішы для рэдагавання кантэнту',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Гэтыя камбінацыі клавіш дазваляюць быстра набіраць функцыі рэдагавання кантэнту.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Клавішы навігацыі па кантэнту і інтэрфейсе карыстальніка',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Выкарыстоўваць наступныя камбінацыі клавіш для больш эфектыўнай навігацыі ў карыстальніцкім інтэрфейсе CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Закрыць контэкставыя всплываючыя вокны, раскрываючыя спісы і дыялогавыя вокны.',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Адкрыць дыялогавыя акно дапамогі па спецыяльным магчымасцям',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Перамясціць фокус паміж палямі формы (уводу, кнопкамі і г. д.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Перамясціць фокус на панэль меню, перамясціцься паміж панелямі меню',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Перамясціць фокус на панэль інструментаў, перамясціцься паміж панэлямі інструментаў',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Навігацыя па панэлі інструментаў або панелі меню',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Актываваць кнопку, на якую ўстаўлены фокус. Актывацыя кнопак, якія ўзаемадзейнічаюць з кантэнтам рэдактара, перамяшчае фокус назад на кантэнт.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Прыняць',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Крыніца',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Параграф',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Выбар колеру',
			// Label for the Insert button.
			'Insert': '',
			// Label for the Update button.
			'Update': '',
			// Label for the Back button.
			'Back': '',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Калі ласка, паспрабуйце іншую фразу або праверце правапіс.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Абгарнуць тэкст',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Разрываць тэкст',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Адмысловы',
			// The default label for the resize option that resets the size.
			'Original': 'Зыходны',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Значэнне не павінна быць пустым.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Значэнне павінна быць простым лікам.'
		},
		getPluralForm: ( n: number ) => (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	}
};

export default translations;
