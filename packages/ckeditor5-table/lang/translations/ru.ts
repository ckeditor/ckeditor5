/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Вставить таблицу',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Вставить табличный макет',
			// Label for the set/unset table header column button.
			'Header column': 'Столбец заголовков',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Вставить столбец слева',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Вставить столбец справа',
			// Label for the delete table column button.
			'Delete column': 'Удалить столбец',
			// Label for the select the entire table column button.
			'Select column': 'Выбрать столбец',
			// Label for the table column dropdown button.
			'Column': 'Столбец',
			// Label for the set/unset table header row button.
			'Header row': 'Строка заголовков',
			// Label for the set/unset table footer row button.
			'Footer row': 'Строка нижнего колонтитула',
			// Label for the insert row below button.
			'Insert row below': 'Вставить строку ниже',
			// Label for the insert row above button.
			'Insert row above': 'Вставить строку выше',
			// Label for the delete table row button.
			'Delete row': 'Удалить строку',
			// Label for the select the entire table row button.
			'Select row': 'Выбрать строку',
			// Label for the table row dropdown button.
			'Row': 'Строка',
			// Label for the merge table cell up button.
			'Merge cell up': 'Объединить с ячейкой сверху',
			// Label for the merge table cell right button.
			'Merge cell right': 'Объединить с ячейкой справа',
			// Label for the merge table cell down button.
			'Merge cell down': 'Объединить с ячейкой снизу',
			// Label for the merge table cell left button.
			'Merge cell left': 'Объединить с ячейкой слева',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Разделить ячейку вертикально',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Разделить ячейку горизонтально',
			// Label for the merge table cells button.
			'Merge cells': 'Объединить ячейки',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Панель инструментов таблицы',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Свойства таблицы',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Свойства ячейки',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Тип ячейки',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Ячейка данных',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Ячейка заголовка',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Заголовок столбца',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Заголовок ряда',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Граница',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Стиль',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Ширина',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Высота',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Цвет',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Фон',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Отступ',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Размеры',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Выравнивание текста в ячейке таблицы',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Выравнивание таблицы',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Панель инструментов горизонтального выравнивания текста',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Панель инструментов вертикального выравнивания текста',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Панель инструментов выравнивания таблицы',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Нет',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Сплошная',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Точечная',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Пунктирная',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Двойная',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Желобчатая',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Ребристая',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Вдавленная',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Выпуклая',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Выровнять текст по левому краю',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Выровнять текст по центру',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Выровнять текст по правому краю',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Выровнять текст по ширине',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Выровнять текст ячейки по верхнему краю',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Выровнять текст ячейки по центру',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Выровнять текст ячейки по нижнему краю',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Выровнять таблицу по левому краю с обтеканием текстом',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Выровнять таблицу по центру без обтекания текстом',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Выровнять таблицу по правому краю с обтеканием текстом',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Выровнять таблицу по левому краю без обтекания текстом',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Выровнять таблицу по правому краю без обтекания текстом',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'Неверный цвет. Попробуйте "#FF0000" или "rgb(255,0,0)" или "red".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'Неверное значение. Попробуйте "10px" или "2em" или просто "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Подпись таблицы',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Нажатия клавиш, которые можно использовать в ячейке таблицы',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Переместить выделение в следующую ячейку',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Переместить выделение на предыдущую ячейку',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Вставить новую строку таблицы (в последней ячейке таблицы)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Навигация по таблице',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Таблица',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Табличный макет',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Таблица макетов',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Таблица содержимого',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Выберите тип таблицы',
			// The accessible label of the table type toolbar button.
			'Table type': 'Тип таблицы',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Параметры типа таблицы'
		}
	}
};

export default translations;
