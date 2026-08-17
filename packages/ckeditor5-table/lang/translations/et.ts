/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'et': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Sisesta tabel',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Sisesta tabeli paigutus',
			// Label for the set/unset table header column button.
			'Header column': 'Päise veerg',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Sisesta veerg vasakule',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Sisesta veerg paremale',
			// Label for the delete table column button.
			'Delete column': 'Kustuta veerg',
			// Label for the select the entire table column button.
			'Select column': 'Vali veerg',
			// Label for the table column dropdown button.
			'Column': 'Veerg',
			// Label for the set/unset table header row button.
			'Header row': 'Päise rida',
			// Label for the set/unset table footer row button.
			'Footer row': 'Jaluse rida',
			// Label for the insert row below button.
			'Insert row below': 'Sisesta rida allapoole',
			// Label for the insert row above button.
			'Insert row above': 'Sisesta rida ülespoole',
			// Label for the delete table row button.
			'Delete row': 'Kustuta rida',
			// Label for the select the entire table row button.
			'Select row': 'Vali rida',
			// Label for the table row dropdown button.
			'Row': 'Rida',
			// Label for the merge table cell up button.
			'Merge cell up': 'Liida ülemise lahtriga',
			// Label for the merge table cell right button.
			'Merge cell right': 'Liida paremal oleva lahtriga',
			// Label for the merge table cell down button.
			'Merge cell down': 'Liida alumise lahtriga',
			// Label for the merge table cell left button.
			'Merge cell left': 'Liida vasakul oleva lahtriga',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Jaga lahter vertikaalselt',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Jaga lahter horisontaalselt',
			// Label for the merge table cells button.
			'Merge cells': 'Liida lahtrid',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Tabelite tööriistariba',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Tabeli omadused',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Lahtri omadused',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Lahtri tüüp',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Andmelahter',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Päise lahter',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Veeru päis',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Rea päis',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Ääris',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Stiil',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Laius',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Kõrgus',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Värvus',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Taust',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Vahe sisuni',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Mõõtmed',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Teksti paigutus lahtris',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Tabeli joondamine',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Teksti rõhtpaigutuse tööriistariba',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Teksti püstpaigutuse tööriistariba',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Tabeli paigutuse tööriistariba',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Puudub',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Pidev',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Punktiir',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Kriipsjoon',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Topelt',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Kraav',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Vall',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Süvik',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Küngas',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Lahtri tekst vasakul',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Lahtri tekst keskel',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Lahtri tekst paremal',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Lahtri tekst rööpjoondatud',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Lahtri tekst üleval',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Lahtri tekst kõrguse järgi keskel',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Lahtri tekst all',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Joonda tabel vasakule, nii et tekst ühtlustuks',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Paiguta tabel keskele, nii et tekst ei ühtlustuks',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Joonda tabel paremale, nii et tekst ühtlustuks',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Joonda tabel vasakule, nii et tekst ei ühtlustuks',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Joonda tabel paremale, nii et tekst ei ühtlustuks',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'Värvus ei sobi. Proovi "#FF0000" või "rgb(255,0,0)" või "red".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'Väärtus ei sobi. Proovi "10px", "2em" või lihtsalt "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Sisesta tabeli pealdis',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Tabeli lahtris kasutatavad klahvikombinatsioonid',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Liiguta valitu järgmisesse lahtrisse',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Liiguta valitu eelmisesse lahtrisse',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Sisesta tabelisse uus rida (kui oled tabeli viimases reas)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Liigu tabelis',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Tabel',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Tabeli paigutus',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Paigutustabel',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Sisutabel',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Vali tabeli tüüp',
			// The accessible label of the table type toolbar button.
			'Table type': 'Tabeli tüüp',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Tabelitüübi valikud'
		}
	}
};

export default translations;
