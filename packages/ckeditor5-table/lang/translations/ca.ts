/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ca': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Introduir taula',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Insereix un disseny de taula',
			// Label for the set/unset table header column button.
			'Header column': 'Columna d\'encapçalament',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Inserir columna a l\'esquerra',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Inserir la columna a la dreta',
			// Label for the delete table column button.
			'Delete column': 'Suprimir la columna',
			// Label for the select the entire table column button.
			'Select column': 'Seleccionar columna',
			// Label for the table column dropdown button.
			'Column': 'Columna',
			// Label for the set/unset table header row button.
			'Header row': 'Fila d\'encapçalament',
			// Label for the set/unset table footer row button.
			'Footer row': 'Fila del peu de pàgina',
			// Label for the insert row below button.
			'Insert row below': 'Inserir la fila a continuació',
			// Label for the insert row above button.
			'Insert row above': 'Inserir fila a sobre',
			// Label for the delete table row button.
			'Delete row': 'Suprimir fila',
			// Label for the select the entire table row button.
			'Select row': 'Seleccionar fila',
			// Label for the table row dropdown button.
			'Row': 'Fila',
			// Label for the merge table cell up button.
			'Merge cell up': 'Combinar la cel·la cap amunt',
			// Label for the merge table cell right button.
			'Merge cell right': 'Combinar la cel·la a la dreta',
			// Label for the merge table cell down button.
			'Merge cell down': 'Combinar la cel·la cap avall',
			// Label for the merge table cell left button.
			'Merge cell left': 'Combinar la cel·la a l\'esquerra',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Dividir la cel·la verticalment',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Dividir la cel·la horitzontalment',
			// Label for the merge table cells button.
			'Merge cells': 'Combinar cel·les',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Barra d\'eines de taula',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Propietats de la taula',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Propietats de la cel·la',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Tipus de cel·la',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Cel·la de dades',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Cel·la de capçalera',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Capçalera de columna',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Capçalera de fila',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Vora',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Estil',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Amplada',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Alçada',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Color',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Fons',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Padding',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Dimensions',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Alineació del text de la cel·la de la taula',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Alineació de la taula',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Barra d\'eines d\'alineació de text horitzontal',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Barra d\'eines d\'alineació de text vertical',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Barra d\'eines d\'alineació de taules',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Cap',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Sòlid',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'De punts',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'De guions',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Doble',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'De solc',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'De cresta',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Entrant',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Sortint',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Alinear el text de la cel·la a l\'esquerra',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Alinear el text de la cel·la al centre',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Alinear el text de la cel·la a la dreta',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Justificar el text de la cel·la',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Alinear el text de la cel·la a la part superior',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Alinear el text de la cel·la al centre',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Alinear el text de la cel·la a la part inferior',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Alinear la taula a l\'esquerra amb ajustament de text',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Taula central sense ajustament de text',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Alinear la taula a la dreta amb ajustament de text',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Alinear la taula a l\'esquerra sense ajustament de text',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Alinear la taula a la dreta sense ajustament de text',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'El color és invàlid. Prova "#FF0000" o "rgb(255,0,0)" o "vermell".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'El valor és invàlid. Prova "10px" o "2em" o simplement "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Introduir el peu de foto de la taula',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Tecles que es poden emprar en la cel·la d\'una taula',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Mou la selecció a la cel·la següent',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Mou la selecció a la cel·la anterior',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Insereix una nova filera (si us trobeu a la darrera cel·la d\'una taula)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Navega a través de la taula',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Taula',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Disseny de la taula',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Taula de dissenys',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Taula de continguts',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Tria el tipus de taula',
			// The accessible label of the table type toolbar button.
			'Table type': 'Tipus de taula',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Opcions de tipus de taula'
		}
	}
};

export default translations;
