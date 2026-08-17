/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'es': {
		dictionary: {
			// Label for the insert table toolbar button.
			'Insert table': 'Insertar tabla',
			// Label for the insert table layout toolbar button.
			'Insert table layout': 'Insertar diseño de tabla',
			// Label for the set/unset table header column button.
			'Header column': 'Columna de encabezado',
			// Label for the insert table column to the left of the current one button.
			'Insert column left': 'Insertar columna izquierda',
			// Label for the insert table column to the right of the current one button.
			'Insert column right': 'Insertar columna derecha',
			// Label for the delete table column button.
			'Delete column': 'Eliminar columna',
			// Label for the select the entire table column button.
			'Select column': 'Seleccionar columna',
			// Label for the table column dropdown button.
			'Column': 'Columna',
			// Label for the set/unset table header row button.
			'Header row': 'Fila de encabezado',
			// Label for the set/unset table footer row button.
			'Footer row': 'Fila de pie de página',
			// Label for the insert row below button.
			'Insert row below': 'Insertar fila debajo',
			// Label for the insert row above button.
			'Insert row above': 'Insertar fila encima',
			// Label for the delete table row button.
			'Delete row': 'Eliminar fila',
			// Label for the select the entire table row button.
			'Select row': 'Seleccionar fila',
			// Label for the table row dropdown button.
			'Row': 'Fila',
			// Label for the merge table cell up button.
			'Merge cell up': 'Combinar celda superior',
			// Label for the merge table cell right button.
			'Merge cell right': 'Combinar celda derecha',
			// Label for the merge table cell down button.
			'Merge cell down': 'Combinar celda inferior',
			// Label for the merge table cell left button.
			'Merge cell left': 'Combinar celda izquierda',
			// Label for the split table cell vertically button.
			'Split cell vertically': 'Dividir celdas verticalmente',
			// Label for the split table cell horizontally button.
			'Split cell horizontally': 'Dividir celdas horizontalmente',
			// Label for the merge table cells button.
			'Merge cells': 'Combinar celdas',
			// The label used by assistive technologies describing a table toolbar attached to a table widget.
			'Table toolbar': 'Barra de herramientas de tabla',
			// The label describing the form allowing to specify the properties of a selected table.
			'Table properties': 'Propiedades de tabla',
			// The label describing the form allowing to specify the properties of a selected table cell.
			'Cell properties': 'Propiedades de celda',
			// The label for the dropdown that allows configuring the type of a table cell (data or header).
			'Cell type': 'Tipo de celda',
			// The label for the dropdown option for a data table cell.
			'Data cell': 'Celda de datos',
			// The label for the dropdown option for a header table cell.
			'Header cell': 'Celda de encabezado',
			// The label for the dropdown option for a header table cell that represents a column header.
			'Column header': 'Encabezado de columna',
			// The label for the dropdown option for a header table cell that represents a row header.
			'Row header': 'Encabezado de fila',
			// The label describing a group of border–related form fields (border style, color, etc.).
			'Border': 'Borde',
			// The label for the dropdown that allows configuring the border style of a table or a table cell.
			'Style': 'Estilo',
			// The label for the input that allows configuring the width of a table or a table cell or the width of a border.
			'Width': 'Ancho',
			// The label for the input that allows configuring the height of a table or a table cell.
			'Height': 'Altura',
			// The label for the input that allows configuring the border color of a table or a table cell.
			'Color': 'Color',
			// The label for the input that allows configuring the background color of a table or a table cell.
			'Background': 'Fondo',
			// The label for the input that allows configuring the padding of a table cell.
			'Padding': 'Márgenes',
			// The label describing a group of form fields that allows setting dimensions of a table or a table cell.
			'Dimensions': 'Dimensiones',
			// The label for the group of toolbars that allows configuring the text alignment in a table cell.
			'Table cell text alignment': 'Alineación texto de celda',
			// The label for the toolbar that allows configuring the alignment of a table.
			'Table Alignment': 'Alineación de la tabla',
			// The label used by assistive technologies describing a toolbar that allows configuring the horizontal text alignment in a table cell.
			'Horizontal text alignment toolbar': 'Alineación horizontal de texto',
			// The label used by assistive technologies describing a toolbar that allows configuring the vertical text alignment in a table cell.
			'Vertical text alignment toolbar': 'Alineación vertical de texto',
			// The label used by assistive technologies describing a toolbar that allows configuring the alignment of a table.
			'Table alignment toolbar': 'Alineación de tabla',
			// The label for the border style dropdown when no style is applied to a table or a table cell.
			'None': 'Ninguno',
			// The label for the border style dropdown when the solid border is applied to a table or a table cell.
			'Solid': 'Sólido',
			// The label for the border style dropdown when the dotted border is applied to a table or a table cell.
			'Dotted': 'Línea de puntos',
			// The label for the border style dropdown when the dashed border is applied to a table or a table cell.
			'Dashed': 'Línea discontinua',
			// The label for the border style dropdown when the double border is applied to a table or a table cell.
			'Double': 'Doble línea',
			// The label for the border style dropdown when the groove border is applied to a table or a table cell.
			'Groove': 'Bisel',
			// The label for the border style dropdown when the ridge border is applied to a table or a table cell.
			'Ridge': 'Marco',
			// The label for the border style dropdown when the inset border is applied to a table or a table cell.
			'Inset': 'Incrustación',
			// The label for the border style dropdown when the outset border is applied to a table or a table cell.
			'Outset': 'Relieve',
			// The label used by assistive technologies describing a button that aligns the table cell text to the left.
			'Align cell text to the left': 'Alinear texto de celda a la izquierda',
			// The label used by assistive technologies describing a button that aligns the table cell text to the center.
			'Align cell text to the center': 'Centrar texto de celda',
			// The label used by assistive technologies describing a button that aligns the table cell text to the right.
			'Align cell text to the right': 'Alinear texto de celda a la derecha',
			// The label used by assistive technologies describing a button that justifies the table cell text.
			'Justify cell text': 'Justificar texto de celda',
			// The label used by assistive technologies describing a button that aligns the table cell text to the top.
			'Align cell text to the top': 'Alinear texto de celda hacia arriba',
			// The label used by assistive technologies describing a button that aligns the table cell text to the middle.
			'Align cell text to the middle': 'Alinear texto de celda al medio',
			// The label used by assistive technologies describing a button that aligns the table cell text to the bottom.
			'Align cell text to the bottom': 'Alinear texto de celda hacia abajo',
			// The label used by assistive technologies describing a button that aligns the table to the left as an inline element, allowing text to wrap around it.
			'Align table to the left with text wrapping': 'Alinear la tabla a la izquierda con ajuste de texto',
			// The label used by assistive technologies describing a button that centers the table as a block element with no text wrapping.
			'Center table with no text wrapping': 'Centrar la tabla sin ajuste de texto',
			// The label used by assistive technologies describing a button that aligns the table to the right as an inline element, allowing text to wrap around it.
			'Align table to the right with text wrapping': 'Alinear la tabla a la derecha con ajuste de texto',
			// The label used by assistive technologies describing a button that aligns the table to the left as a block element with no text wrapping.
			'Align table to the left with no text wrapping': 'Alinear la tabla a la izquierda sin ajuste de texto',
			// The label used by assistive technologies describing a button that aligns the table to the right as a block element with no text wrapping.
			'Align table to the right with no text wrapping': 'Alinear la tabla a la derecha sin ajuste de texto',
			// The localized error string that can be displayed next to color (background, border) fields that have an invalid value
			'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".': 'El color es inválido. Intente con "#FF0000", "rgb(255,0,0)" o "red".',
			// The localized error string that can be displayed next to length (padding, border width) fields that have an invalid value.
			'The value is invalid. Try "10px" or "2em" or simply "2".': 'El valor es inválido. Intente con "10px", "2em" o simplemente "2".',
			// The placeholder text for the table caption displayed when the caption is empty.
			'Enter table caption': 'Ingresar título de tabla',
			// Accessibility help dialog header text displayed before the list of keystrokes that can be used in a table cell.
			'Keystrokes that can be used in a table cell': 'Teclas que se pueden utilizar en una celda de tabla',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the next cell.
			'Move the selection to the next cell': 'Mueve la selección a la siguiente celda',
			// Keystroke description for assistive technologies: keystroke for moving the selection to the previous cell.
			'Move the selection to the previous cell': 'Mueve la selección a la celda anterior',
			// Keystroke description for assistive technologies: keystroke for inserting a new table row.
			'Insert a new table row (when in the last cell of a table)': 'Inserta una nueva fila de la tabla (cuando esté en la última celda de una tabla)',
			// Keystroke description for assistive technologies: keystroke for navigating through the table.
			'Navigate through the table': 'Navega por la tabla',
			// The accessible label of the menu bar button that displays a user interface to insert a table into editor content.
			'Table': 'Tabla',
			// The accessible label used in the table layout insert UI element.
			'Table layout': 'Diseño de tabla',
			// The accessible label of the layout table type dropdown button.
			'Layout table': 'Tabla de diseño',
			// The accessible label of the content table type dropdown button.
			'Content table': 'Tabla de contenido',
			// The accessible label of the table balloon button that displays a user interface to choose table type.
			'Choose table type': 'Elegir tipo de tabla',
			// The accessible label of the table type toolbar button.
			'Table type': 'Tipo de tabla',
			// The accessible label of dropdown list that displays a user interface to choose table type.
			'Table type options': 'Opciones del tipo de tabla'
		}
	}
};

export default translations;
