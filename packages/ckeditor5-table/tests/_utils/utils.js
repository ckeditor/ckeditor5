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
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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
 * Helper method for creating a test table with a single table cell which attributes might be objects.
 *
 *		setTableCellWithObjectAttributes(
 *			model,
 *			{
 *				margin: { top: '1px', left: '2px' },
 *				borderColor: { top: '#f00', left: '#ba2' }
 *				backgroundColor: '#f00'
 *			},
 *			'fo[o]'
 *		);
 *
 * This will create a model table with one table cell with a "foo" text. Selection will be set on last "o" and a table cell will have three
 * attributes.
 *
 * @param {module:engine/model/model~Model} model
 * @param {Object} attributes
 * @param {String} cellContent
 */
export function setTableCellWithObjectAttributes( model, attributes, cellContent ) {
	setData( model, modelTable( [ [ { contents: cellContent } ] ] ) );

	const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

	model.change( writer => {
		for ( const [ key, value ] of Object.entries( attributes ) ) {
			writer.setAttribute( key, value, tableCell );
		}
	} );
}

/**
 * Helper method for creating a test table, with a single table cell, which attributes might be objects.
 *
 *		setTableWithObjectAttributes(
 *			model,
 *			{
 *				borderColor: { top: '#f00', left: '#ba2' }
 *				backgroundColor: '#f00'
 *			},
 *			'fo[o]'
 *		);
 *
 * This will create a model table with one table cell with a "foo" text. Selection will be set on last "o" and a table will have three
 * attributes.
 *
 * @param {module:engine/model/model~Model} model
 * @param {Object} attributes
 * @param {String} cellContent
 */
export function setTableWithObjectAttributes( model, attributes, cellContent ) {
	setData( model, modelTable( [ [ { contents: cellContent } ] ] ) );

	const table = model.document.getRoot().getChild( 0 );

	model.change( writer => {
		for ( const [ key, value ] of Object.entries( attributes ) ) {
			writer.setAttribute( key, value, table );
		}
	} );
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
		isLimit: true
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

	// Styles
	schema.extend( 'tableCell', {
		allowAttributes: [ 'border' ]
	} );
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

	// Styles
	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			name: 'td',
			styles: {
				border: /[\s\S]+/
			}
		},
		model: {
			key: 'border',
			value: viewElement => viewElement.getStyle( 'border' )
		}
	} );
}

/**
 * Assertion helper for top-right-bottom-left attribute object.
 *
 * @param {module:engine/model/node~Node} element
 * @param {String} key Attribute key
 * @param {String} top Top value. Pass null to omit value in attributes object.
 * @param {String} [right=top] Right value - defaults to top if not provided.
 * Pass null to omit value in attributes object.
 * @param {String} [bottom=top] Bottom value - defaults to top (right value must be defined).
 * Pass null to omit value in attributes object.
 * @param {String} [left=right] Left value - defaults to right (bottom and right values must be defined).
 * Pass null to omit value in attributes object.
 */
export function assertTRBLAttribute( element, key, top, right = top, bottom = top, left = right ) {
	const styleObject = {};

	if ( top ) {
		styleObject.top = top;
	}

	if ( right ) {
		styleObject.right = right;
	}

	if ( bottom ) {
		styleObject.bottom = bottom;
	}

	if ( left ) {
		styleObject.left = left;
	}

	expect( element.getAttribute( key ) ).to.deep.equal( styleObject );
}

/**
 * Assertion helper for testing <table> style attribute.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {String} tableStyle A style to assert on table.
 */
export function assertTableStyle( editor, tableStyle ) {
	const styleEntry = tableStyle ? ` style="${ tableStyle }"` : '';

	assertEqualMarkup( editor.getData(),
		`<figure class="table"><table${ styleEntry }><tbody><tr><td>foo</td></tr></tbody></table></figure>`
	);
}

/**
 * Assertion helper for testing <td> style attribute.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {String} tableCellStyle A style to assert on td.
 */
export function assertTableCellStyle( editor, tableCellStyle ) {
	assertEqualMarkup( editor.getData(),
		'<figure class="table"><table><tbody><tr>' +
			`<td${ tableCellStyle ? ` style="${ tableCellStyle }"` : '' }>foo</td>` +
		'</tr></tbody></table></figure>'
	);
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

				if ( isObject ) {
					if ( tableCellData.isHeading ) {
						resultingCellElement = headingElement;
					}

					delete tableCellData.contents;
					delete tableCellData.isHeading;
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
				tableRowString += `<${ resultingCellElement }${ formattedAttributes }>${ contents }</${ resultingCellElement }>`;

				return tableRowString;
			}, '' );

			return `${ previousRowsString }<${ rowElement }>${ tableRowString }</${ rowElement }>`;
		}, '' );
}
