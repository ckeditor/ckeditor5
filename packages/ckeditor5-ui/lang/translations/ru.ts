/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Редактор',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Редактировать блок',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Нажмите, чтобы редактировать блок',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Перетащить',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Следующий',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Предыдущий',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Панель инструментов редактора',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Выпадающая панель инструментов',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Раскрывающееся меню',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Чёрный',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Тёмно-серый',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Серый',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Светло-серый',
			// Label of a button that applies a white color in color pickers.
			'White': 'Белый',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Красный',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Оранжевый',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Жёлтый',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Салатовый',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Зелёный',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Аквамариновый',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Бирюзовый',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Голубой',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Синий',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Фиолетовый',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Панель инструментов редактора',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Контекстуальная панель инструментов редактора',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Результаты не найдены',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Нет элементов для поиска',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Диалоговое окно редактора',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Закрыть',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Содержание справки. Чтобы закрыть это диалоговое окно, нажмите ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Ниже вы можете найти список сочетаний клавиш, которые можно использовать в редакторе.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(может требовать <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Доступность',
			// Accessibility help dialog title.
			'Accessibility help': 'Помощь по специальным возможностям',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Нажмите %0 для получения помощи.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Переместить фокус в активное диалоговое окно и обратно.',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Файл',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Редактировать',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Посмотреть',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Вставить',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Формат',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Инструменты',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Помощь',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Текст',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Шрифт',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Панель меню редактора',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Введите действительный цвет (например, "ff0000").'
		}
	}
};

export default translations;
