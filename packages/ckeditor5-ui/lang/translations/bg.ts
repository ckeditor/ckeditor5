/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bg': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Богат текстов редактор',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Редактирай блок',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Кликнете, за да редактирате блок',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Плъзнете за преместване',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Следващ',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Предишен',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Лента за редакция',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Лента с падащо меню',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Падащо меню',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Черен',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Тъмно сив',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Сив',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Светло сив',
			// Label of a button that applies a white color in color pickers.
			'White': 'Бял',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Червен',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Оранжев',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Жълт',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Светло зелен',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Зелен',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Аквамарин',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Тюркоазен',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Светло син',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Син',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Лилав',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Лента с инструменти за блокиране на съдържанието на редактора',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Контекстна лента с инструменти на редактора',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'НЕХ',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Няма намерени резултати',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Няма елементи за търсене',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Диалогов прозорец на редактора',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Затвори',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Помощно съдържание. За да затворите този прозорец, натиснете ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Долу можете да намерите списък от клавишни комбинации, които могат да се използват в редактора.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(може да изисква <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Достъпност',
			// Accessibility help dialog title.
			'Accessibility help': 'Помощ за достъпност',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Натиснете %0 за помощ.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Приближаване и отдалечаване на фокуса в активен диалогов прозорец',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Файл',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Редактирай',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Преглед',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Вмъкни',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Формат',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Инструменти',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Помощ',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Текст',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Шрифт',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Редактор на лентата с менюта',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Моля, въведете валиден цвят (напр. "ff0000").'
		}
	}
};

export default translations;
