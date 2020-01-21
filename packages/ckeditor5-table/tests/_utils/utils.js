/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow,
	downcastTableHeadingColumnsChange,
	downcastTableHeadingRowsChange
} from '../../src/converters/downcast';
import upcastTable, { upcastTableCell } from '../../src/converters/upcasttable';

const WIDGET_TABLE_CELL_CLASS = 'ck-editor__editable ck-editor__nested-editable';

/**
 * Returns a model representation of a table shorthand notation:
 *
 *		modelTable( [
 *			[ '00' ] // first row
 *			[ '10' ] // second row
 *		] );
 *
 *	will output:
 *
 *		'<table><tableRow><tableCell>00</tableCell></tableRow><tableRow><tableCell>10</tableCell></tableRow></table>'
 *
 * Each table row passed in `tableData` array is represented as an array of strings or objects. A string defines text contents of a cell.
 *
 * Passing an object allows to pass additional table cell attributes:
 *
 *		const tableCellData = {
 *			colspan: 2,
 *			rowspan: 4,
 *			contents: 'foo' // text contents of a cell
 *		};
 *
 * @param {Array.<Array.<String>|Object>} tableData
 * @param {Object} [attributes] Optional table attributes: `headingRows` and `headingColumns`.
 *
 * @returns {String}
 */
export function modelTable( tableData, attributes ) {
	const tableRows = makeRows( tableData, {
		cellElement: 'tableCell',
		rowElement: 'tableRow',
		headingElement: 'tableCell',
		wrappingElement: 'paragraph',
		enforceWrapping: true
	} );

	return `<table${ formatAttributes( attributes ) }>${ tableRows }</table>`;
}

/**
 * Returns a view representation of a table shorthand notation:
 *
 *		viewTable( [
 *			[ '00', '01' ] // first row
 *			[ '10', '11' ] // second row
 *		] );
 *
 *	will output:
 *
 *		'<table><tbody><tr><td>00</td><td>01<td></tr><tr><td>10</td><td>11<td></tr></tbody></table>'
 *
 * Each table row passed in `tableData` array is represented as an array of strings or objects. A string defines text contents of a cell.
 *
 * Passing an object allows to pass additional table cell attributes:
 *
 *		const tableCellData = {
 *			colspan: 2,
 *			rowspan: 4,
 *			isHeading: true, // will render table cell as `<th>` element
 *			contents: 'foo' // text contents of a cell
 *		};
 *
 * @param {Array.<Array.<String|Object>>} tableData The table data array.
 * @param {Object} [attributes] Optional table attributes: `headingRows` and `headingColumns` - passing them will properly render rows
 * in `<tbody>` or `<thead>` sections.
 *
 * @returns {String}
 */
export function viewTable( tableData, attributes = {} ) {
	const headingRows = attributes.headingRows || 0;
	const asWidget = !!attributes.asWidget;

	const thead = headingRows > 0 ? `<thead>${ makeRows( tableData.slice( 0, headingRows ), {
		cellElement: 'th',
		rowElement: 'tr',
		headingElement: 'th',
		wrappingElement: asWidget ? 'span' : 'p',
		enforceWrapping: asWidget,
		asWidget
	} ) }</thead>` : '';

	const tbody = tableData.length > headingRows ?
		`<tbody>${ makeRows( tableData.slice( headingRows ), {
			cellElement: 'td',
			rowElement: 'tr',
			headingElement: 'th',
			wrappingElement: asWidget ? 'span' : 'p',
			enforceWrapping: asWidget,
			asWidget
		} ) }</tbody>` : '';

	const figureAttributes = asWidget ?
		'class="ck-widget ck-widget_with-selection-handle table" contenteditable="false"' : 'class="table"';
	const widgetHandler = '<div class="ck ck-widget__selection-handle"></div>';

	return `<figure ${ figureAttributes }>${ asWidget ? widgetHandler : '' }<table>${ thead }${ tbody }</table></figure>`;
}

/**
 * Formats model or view table - useful for chai assertions debugging.
 *
 * @param {String} tableString
 * @returns {String}
 */
export function formatTable( tableString ) {
	return tableString
		.replace( /<tableRow>/g, '\n<tableRow>\n    ' )
		.replace( /<thead>/g, '\n<thead>\n    ' )
		.replace( /<tbody>/g, '\n<tbody>\n    ' )
		.replace( /<tr>/g, '\n<tr>\n    ' )
		.replace( /<\/tableRow>/g, '\n</tableRow>' )
		.replace( /<\/thead>/g, '\n</thead>' )
		.replace( /<\/tbody>/g, '\n</tbody>' )
		.replace( /<\/tr>/g, '\n</tr>' )
		.replace( /<\/table>/g, '\n</table>' )
		.replace( /<\/figure>/g, '\n</figure>' );
}

/**
 * Returns formatted model table string.
 *
 * @param {Array.<String>} tableData
 * @param {Object} [attributes]
 * @returns {String}
 */
export function formattedModelTable( tableData, attributes ) {
	const tableString = modelTable( tableData, attributes );

	return formatTable( tableString );
}

/**
 * Returns formatted view table string.
 *
 * @param {Array.<String>} tableData
 * @param {Object} [attributes]
 * @returns {String}
 */
export function formattedViewTable( tableData, attributes ) {
	return formatTable( viewTable( tableData, attributes ) );
}

export function defaultSchema( schema, registerParagraph = true ) {
	schema.register( 'table', {
		allowWhere: '$block',
		allowAttributes: [ 'headingRows', 'headingColumns' ],
		isLimit: true,
		isObject: true,
		isBlock: true
	} );

	schema.register( 'tableRow', {
		allowIn: 'table',
		isLimit: true
	} );

	schema.register( 'tableCell', {
		allowIn: 'tableRow',
		allowAttributes: [ 'colspan', 'rowspan' ],
		isObject: true
	} );

	// Allow all $block content inside table cell.
	schema.extend( '$block', { allowIn: 'tableCell' } );

	// Disallow table in table.
	schema.addChildCheck( ( context, childDefinition ) => {
		if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
			return false;
		}
	} );

	if ( registerParagraph ) {
		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
	}
}

export function defaultConversion( conversion, asWidget = false ) {
	conversion.elementToElement( { model: 'paragraph', view: 'p' } );

	// Table conversion.
	conversion.for( 'upcast' ).add( upcastTable() );
	conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget } ) );

	// Table row conversion.
	conversion.for( 'upcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );
	conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget } ) );
	conversion.for( 'downcast' ).add( downcastRemoveRow( { asWidget } ) );

	// Table cell conversion.
	conversion.for( 'upcast' ).add( upcastTableCell( 'td' ) );
	conversion.for( 'upcast' ).add( upcastTableCell( 'th' ) );
	conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget } ) );

	// Table attributes conversion.
	conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
	conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

	conversion.for( 'downcast' ).add( downcastTableHeadingColumnsChange( { asWidget } ) );
	conversion.for( 'downcast' ).add( downcastTableHeadingRowsChange( { asWidget } ) );
}

// Formats table cell attributes
//
// @param {Object} attributes Attributes of a cell.
function formatAttributes( attributes ) {
	let attributesString = '';

	if ( attributes ) {
		const entries = Object.entries( attributes );

		if ( entries.length ) {
			attributesString = ' ' + entries.map( entry => `${ entry[ 0 ] }="${ entry[ 1 ] }"` ).join( ' ' );
		}
	}

	return attributesString;
}

// Formats passed table data to a set of table rows.
function makeRows( tableData, options ) {
	const { cellElement, rowElement, headingElement, wrappingElement, enforceWrapping, asWidget } = options;

	return tableData
		.reduce( ( previousRowsString, tableRow ) => {
			const tableRowString = tableRow.reduce( ( tableRowString, tableCellData ) => {
				const isObject = typeof tableCellData === 'object';

				let contents = isObject ? tableCellData.contents : tableCellData;

				let resultingCellElement = cellElement;
				let isSelected = false;

				if ( isObject ) {
					if ( tableCellData.isHeading ) {
						resultingCellElement = headingElement;
					}

					isSelected = !!tableCellData.isSelected;

					delete tableCellData.contents;
					delete tableCellData.isHeading;
					delete tableCellData.isSelected;
				}

				const attributes = isObject ? tableCellData : {};

				if ( asWidget ) {
					attributes.class = WIDGET_TABLE_CELL_CLASS + ( attributes.class ? ` ${ attributes.class }` : '' );
					attributes.contenteditable = 'true';
				}

				if ( !( contents.replace( '[', '' ).replace( ']', '' ).startsWith( '<' ) ) && enforceWrapping ) {
					contents = `<${ wrappingElement }>${ contents }</${ wrappingElement }>`;
				}

				const formattedAttributes = formatAttributes( attributes );
				const tableCell = `<${ resultingCellElement }${ formattedAttributes }>${ contents }</${ resultingCellElement }>`;

				tableRowString += isSelected ? `[${ tableCell }]` : tableCell;

				return tableRowString;
			}, '' );

			return `${ previousRowsString }<${ rowElement }>${ tableRowString }</${ rowElement }>`;
		}, '' );
}
