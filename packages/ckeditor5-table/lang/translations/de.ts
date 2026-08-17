/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Tabelle einfügen',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Tabellenlayout einfügen',
			// Label for the set/unset table header column button.
			'Header column': 'Kopfspalte',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Spalte links einfügen',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Spalte rechts einfügen',
			// Label for the delete table column button.
			'Delete column': 'Spalte löschen',
			// Label for the select the entire table column button.
			'Select column': 'Spalte auswählen',
			// Label for the table column dropdown button.
			'Column': 'Spalte',
			// Label for the set/unset table header row button.
			'Header row': 'Kopfzeile',
			// Label for the set/unset table footer row button.
			'Footer row': 'Fußzeile',
			// Label for the insert row below button.
			'Insert row below': 'Zeile unten einfügen',
			// Label for the insert row above button.
			'Insert row above': 'Zeile oben einfügen',
			// Label for the delete table row button.
			'Delete row': 'Zeile löschen',
			// Label for the select the entire table row button.
			'Select row': 'Zeile auswählen',
			// Label for the table row dropdown button.
			'Row': 'Zeile',
			// Label for the merge table cell up button.
			'Merge cell up': 'Zelle oben verbinden',
			// Label for the merge table cell right button.
			'Merge cell right': 'Zelle rechts verbinden',
			// Label for the merge table cell down button.
			'Merge cell down': 'Zelle unten verbinden',
			// Label for the merge table cell left button.
			'Merge cell left': 'Zelle links verbinden',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Zelle vertikal teilen',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Zelle horizontal teilen',
			// Label for the merge table cells button.
			'Merge cells': 'Zellen verbinden',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Tabelle Werkzeugleiste',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Tabelleneigenschaften',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Zelleneigenschaften',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Zelltyp',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Datenzelle',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Kopfzelle',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Spaltentitel',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Zeilentitel',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Rahmen',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Rahmenart',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Breite',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Höhe',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Farbe',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Hintergrund',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Innenabstand',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Größe',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Ausrichtung des Zellentextes',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Tabellenausrichtung',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Werkzeugleiste für die horizontale Zellentext-Ausrichtung',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Werkzeugleiste für die vertikale Zellentext-Ausrichtung',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Werkzeugleiste für die Tabellen-Ausrichtung',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Kein Rahmen',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Durchgezogen',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Gepunktet',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Gestrichelt',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Doppelt',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Eingeritzt',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Hervorgehoben',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Eingelassen',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Geprägt',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Zellentext linksbündig ausrichten',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Zellentext zentriert ausrichten',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Zellentext rechtsbündig ausrichten',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Zellentext als Blocksatz ausrichten',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Zellentext oben ausrichten',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Zellentext mittig ausrichten',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Zellentext unten ausrichten',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Tabelle mit Textumbruch linksbündig ausrichten',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Tabelle ohne Textumbruch zentrieren',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Tabelle mit Textumbruch rechtsbündig ausrichten',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Tabelle ohne Textumbruch linksbündig ausrichten',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Tabelle ohne Textumbruch rechtsbündig ausrichten',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'Die Farbe ist ungültig. Probieren Sie „#FF0000“ oder „rgb(255,0,0)“ oder „red“.',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'Der Wert ist ungültig. Probieren Sie „10px“ oder „2em“ oder „2“.',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Tabellenüberschrift eingeben',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Tastatureingaben, die in einer Tabelle benutz werden können.',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Auswahl in die nächste Zelle verschieben',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Auswahl in die vorherige Zelle verschieben',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Eine neue Tabellenspalte einfügen (wenn in der letzten Tabellenzelle)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Tabellennavigation',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Tabelle',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Tabellenlayout',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Layouttabelle',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Inhaltstabelle',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Tabellentyp auswählen',
			// The accessible label of the table type toolbar button.
			'Table type': 'Tabellentyp',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Tabellentyp-Optionen'
		}
	}
};

export default translations;
