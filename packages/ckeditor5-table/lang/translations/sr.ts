/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Додај табелу',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Umetnite raspored tabele',
			// Label for the set/unset table header column button.
			'Header column': 'Колона за заглавље',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Додај колону лево',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Додај колону десно',
			// Label for the delete table column button.
			'Delete column': 'Бриши колону',
			// Label for the select the entire table column button.
			'Select column': 'Изабери колону',
			// Label for the table column dropdown button.
			'Column': 'Колона',
			// Label for the set/unset table header row button.
			'Header row': 'Ред за заглавлје',
			// Label for the set/unset table footer row button.
			'Footer row': 'Donji red tabele',
			// Label for the insert row below button.
			'Insert row below': 'Додај ред испод',
			// Label for the insert row above button.
			'Insert row above': 'Додај ред изнад',
			// Label for the delete table row button.
			'Delete row': 'Бриши ред',
			// Label for the select the entire table row button.
			'Select row': 'Изабери ред',
			// Label for the table row dropdown button.
			'Row': 'Ред',
			// Label for the merge table cell up button.
			'Merge cell up': 'Спој ћелије на горе',
			// Label for the merge table cell right button.
			'Merge cell right': 'Спој ћелије на десно',
			// Label for the merge table cell down button.
			'Merge cell down': 'Спој ћелије на доле',
			// Label for the merge table cell left button.
			'Merge cell left': 'Cпој ћелије на лево',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Дели ћелије усправно',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Дели ћелије водоравно',
			// Label for the merge table cells button.
			'Merge cells': 'Спој ћелије',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Табела трака са алаткама',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Својства табеле',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Својства ћелије',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Tip ćelije',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Ćelija sa podacima',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Zaglavna ćelija',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Zaglavlje kolone',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Zaglavlje reda',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Граница',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Стил',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Ширина',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Висина',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Боја',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Позадина',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Постављање',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Димензија',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Поравнај тексту табели',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Poravnjavanje tabele',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Хоризонтална трака са алаткама за поравнање текста',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Вертикална трака са алаткама за поравнање текста',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Трака са алаткама за поравнање табеле',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Ниједан',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Чврст',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Са тачкама',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Разбијено',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Двоструко',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Колосек',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Гребен',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Прилог',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Почетак',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Поравнајте текст ћелије лево',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Поравнајте текст ћелије у средину',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Поравнајте текст ћелије десно',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Оправдајте текст ћелије',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Поравнајте текст ћелије према горе',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Поравнајте текст ћелије у средину',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Поравнајте текст ћелије према доле',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Poravnaj tabelu levo sa prelomom teksta',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Centriraj tabelu bez preloma teksta',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Poravnaj tabelu desno sa prelomom teksta',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Poravnaj tabelu levo bez preloma teksta',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Poravnaj tabelu desno bez preloma teksta',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'Боја је неважећа. Покушајте са "#FF0000" или "rgb(255,0,0)" или "црвена".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'Вредност је неважећа. Покушајте са "10px" или "2em" или једноставно "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Унесите наслов табеле ',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Tasteri koji se mogu koristiti u ćeliji tabele',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Pomeri odabir u sledeću ćeliju',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Pomeri odabir u prethodnu ćeliju',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Umetni novi red u tabeli (kada je u poslednjoj ćeliji tabele)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Kretanje kroz tabelu',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Tabela',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Raspored tabele',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Tabela rasporeda',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Tabela sadržaja',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Izaberite tip tabele',
			// The accessible label of the table type toolbar button.
			'Table type': 'Tip tabele',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Opcije tipa tabele'
		}
	}
};

export default translations;
