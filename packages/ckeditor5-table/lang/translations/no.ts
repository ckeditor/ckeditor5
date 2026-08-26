/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Sett inn tabell',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Sett inn tabelloppsett',
			// Label for the set/unset table header column button.
			'Header column': 'Overskriftkolonne',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Sett inn kolonne til venstre',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Sett inn kolonne til høyre',
			// Label for the delete table column button.
			'Delete column': 'Slett kolonne',
			// Label for the select the entire table column button.
			'Select column': 'Velg kolonne ',
			// Label for the table column dropdown button.
			'Column': 'Kolonne',
			// Label for the set/unset table header row button.
			'Header row': 'Overskriftrad',
			// Label for the set/unset table footer row button.
			'Footer row': 'Bunnrad',
			// Label for the insert row below button.
			'Insert row below': 'Sett inn rad under',
			// Label for the insert row above button.
			'Insert row above': 'Sett inn rad over',
			// Label for the delete table row button.
			'Delete row': 'Slett rad',
			// Label for the select the entire table row button.
			'Select row': 'Velg rad',
			// Label for the table row dropdown button.
			'Row': 'Rad',
			// Label for the merge table cell up button.
			'Merge cell up': 'Slå sammen celle over',
			// Label for the merge table cell right button.
			'Merge cell right': 'Slå sammen celle til høyre',
			// Label for the merge table cell down button.
			'Merge cell down': 'Slå sammen celle under',
			// Label for the merge table cell left button.
			'Merge cell left': 'Slå sammen celle til venstre',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Del opp celle vertikalt',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Del opp celle horisontalt',
			// Label for the merge table cells button.
			'Merge cells': 'Slå sammen celler',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Tabell verktøylinje ',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Egenskaper for tabell',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Celleegenskaper ',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Celletype',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Datacelle',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Overskriftscelle',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Kolonneoverskrift',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Radoverskrift',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Kantlinje ',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Stil ',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Bredde',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Høyde',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Farge',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Bakgrunn ',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Fylling',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Dimensjoner',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Celle tekstjustering ',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Tabelljustering',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Verktøylinje for justering av tekst horisontalt ',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Verktøylinje for justering av tekst vertikalt ',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Verktøylinje for justering av tabell ',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Ingen',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Hel',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Stiplede',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Stiplet',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Dobbel ',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Grov',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Kjede',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Innover',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Utover',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Juster celletekst til venstre ',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Juster celletekst til midten ',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Juster celletekst til høyre ',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Rett celletekst ',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Juster celletekst til topp',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Juster celletekst til midten',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Juster celletekst til bunn ',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Venstrejuster tabellen med tekstbryting',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Sentrer tabellen uten tekstbryting',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Høyrejuster tabellen med tekstbryting',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Venstrejuster tabellen uten tekstbryting',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Høyrejuster tabellen uten tekstbryting',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'Ugyldig farge ',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'Ugyldig verdi ',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Legg inn tabelltekst',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Tastetrykk som kan brukes i en tabellcelle',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Flytt valget til den neste cellen',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Flytt valget til den forrige cellen',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Sett inn en ny tabellrad (når man står i den siste cellen i en tabell)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Naviger gjennom tabellen',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Tabell',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Tabelloppsett',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Oppsettstabell',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Innholdstabell',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Velg tabelltype',
			// The accessible label of the table type toolbar button.
			'Table type': 'Tabelltype',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Alternativer for tabelltype'
		}
	}
};

export default translations;
