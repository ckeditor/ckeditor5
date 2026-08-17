/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pl': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Wstaw tabelę',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Wstaw layout tabeli',
			// Label for the set/unset table header column button.
			'Header column': 'Kolumna nagłówka',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Wstaw kolumnę z lewej',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Wstaw kolumnę z prawej',
			// Label for the delete table column button.
			'Delete column': 'Usuń kolumnę',
			// Label for the select the entire table column button.
			'Select column': 'Zaznacz kolumnę',
			// Label for the table column dropdown button.
			'Column': 'Kolumna',
			// Label for the set/unset table header row button.
			'Header row': 'Wiersz nagłówka',
			// Label for the set/unset table footer row button.
			'Footer row': 'Wiersz stopki',
			// Label for the insert row below button.
			'Insert row below': 'Wstaw wiersz poniżej',
			// Label for the insert row above button.
			'Insert row above': 'Wstaw wiersz ponad',
			// Label for the delete table row button.
			'Delete row': 'Usuń wiersz',
			// Label for the select the entire table row button.
			'Select row': 'Zaznacz wiersz',
			// Label for the table row dropdown button.
			'Row': 'Wiersz',
			// Label for the merge table cell up button.
			'Merge cell up': 'Scal komórkę w górę',
			// Label for the merge table cell right button.
			'Merge cell right': 'Scal komórkę w prawo',
			// Label for the merge table cell down button.
			'Merge cell down': 'Scal komórkę w dół',
			// Label for the merge table cell left button.
			'Merge cell left': 'Scal komórkę w lewo',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Podziel komórkę pionowo',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Podziel komórkę poziomo',
			// Label for the merge table cells button.
			'Merge cells': 'Scal komórki',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Pasek narzędzi tabel',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Właściwości tabeli',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Właściwości komórki',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Typ komórki',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Komórka danych',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Komórka nagłówka',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Nagłówek kolumny',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Nagłówek wiersza',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Obramowanie',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Styl',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Szerokość',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Wysokość',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Kolor',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Tło',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Dopełnienie',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Wymiary',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Wyrównanie tekstu komórki tabeli',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Wyrównanie tabeli',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Pasek narzędzi wyrównania tekstu w poziomie',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Pasek narzędzi wyrównania tekstu w pionie',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Pasek narzędzi wyrównania tabeli',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Brak',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Ciągłe',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Kropkowane',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Kreskowane',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Podwójne',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Wklęsłe',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Wypukłe',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Zapadnięte',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Wysunięte',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Wyrównaj tekst w komórce do lewej',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Wyrównaj tekst w komórce do środka',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Wyrównaj tekst w komórce do prawej',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Wyjustuj tekst komórki',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Wyrównaj tekst w komórce do góry',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Wyrównaj tekst w komórce do środka',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Wyrównaj tekst w komórce do dołu',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Wyrównaj tabelę do lewej z zawijaniem tekstu',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Wyśrodkuj tabelę bez zawijania tekstu',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Wyrównaj tabelę do prawej z zawijaniem tekstu',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Wyrównaj tabelę do lewej bez zawijania tekstu',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Wyrównaj tabelę do prawej bez zawijania tekstu',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'Kolor jest niepoprawny. Spróbuj wpisać "#FF0000", "rgb(255,0,0)" lub "red".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'Wartość jest niepoprawna. Spróbuj  wpisać "10px", "2em" lub po prostu "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Wprowadź podpis tabeli',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Klawisze, których można używać w komórce tabeli',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Przenosi zaznaczenie do następnej komórki',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Przenosi zaznaczenie do poprzedniej komórki',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Wstawia nowy wiersz tabeli (w przypadku ostatniej komórki tabeli)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Umożliwia poruszanie się po tabeli',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Tabela',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Layout tabeli',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Tabela layoutu',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Tabela zawartości',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Wybierz typ tabeli',
			// The accessible label of the table type toolbar button.
			'Table type': 'Typ tabeli',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Opcje typu tabeli'
		}
	}
};

export default translations;
