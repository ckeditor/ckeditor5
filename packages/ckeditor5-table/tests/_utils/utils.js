/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import TableWalker from '../../src/tablewalker';

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
 * A helper method for creating a test table with a single table cell of which attributes are defined as objects.
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
 * This will create a model table with one table cell with a "foo" text.
 * The selection will be set on the last "o" and a table cell will have three attributes.
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
 * A helper method for creating a test table, with a single table cell. Table attributes are defined as objects.
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
 * This will create a model table with one table cell with a "foo" text.
 * The selection will be set on last "o" and a table will have three attributes.
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
	if ( attributes.headingColumns ) {
		throw new Error( 'The headingColumns attribute is not supported in viewTable util' );
	}

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
 * An assertion helper for top-right-bottom-left attribute object.
 *
 * @param {module:engine/model/node~Node} element
 * @param {String} key Attribute key
 * @param {String} top Top value. Pass `null` to omit the value in the attributes object.
 * @param {String} [right=top] Right value - defaults to top if not provided.
 * Pass `null` to omit the value in the attributes object.
 * @param {String} [bottom=top] Bottom value - defaults to top (right value must be defined).
 * Pass `null` to omit the value in the attributes object.
 * @param {String} [left=right] Left value - defaults to right (bottom and right values must be defined).
 * Pass `null` to omit the value in the attributes object.
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
 * An assertion helper for testing the `<table>` style attribute.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {String} [tableStyle=''] A style to assert on <table>.
 * @param {String} [figureStyle=''] A style to assert on <figure>.
 */
export function assertTableStyle( editor, tableStyle, figureStyle ) {
	const tableStyleEntry = tableStyle ? ` style="${ tableStyle }"` : '';
	const figureStyleEntry = figureStyle ? ` style="${ figureStyle }"` : '';

	expect( editor.getData() ).to.equalMarkup(
		`<figure class="table"${ figureStyleEntry }>` +
			`<table${ tableStyleEntry }>` +
				'<tbody><tr><td>foo</td></tr></tbody>' +
			'</table>' +
		'</figure>'
	);
}

/**
 * An assertion helper for testing the `<td>` style attribute.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {String} [tableCellStyle=''] A style to assert on td.
 */
export function assertTableCellStyle( editor, tableCellStyle ) {
	expect( editor.getData() ).to.equalMarkup(
		'<figure class="table"><table><tbody><tr>' +
		`<td${ tableCellStyle ? ` style="${ tableCellStyle }"` : '' }>foo</td>` +
		'</tr></tbody></table></figure>'
	);
}

/**
 * A helper method for asserting selected table cells.
 *
 * To check if a table has expected cells selected pass two dimensional array of truthy and falsy values:
 *
 *		assertSelectedCells( model, [
 *			[ 0, 1 ],
 *			[ 0, 1 ]
 *		] );
 *
 * The above call will check if table has second column selected (assuming no spans).
 *
 * **Note**: This function operates on child indexes - not rows/columns.
 *
 * Examples:
 *
 * 		+----+----+----+----+
 * 		| 00 | 01 | 02 | 03 |
 * 		+----+    +----+----+
 * 		|[10]|    |[12]|[13]|
 * 		+----+----+----+----+
 * 		| 20 | 21 | 22 | 23 |
 * 		+----+----+----+----+
 * 		| 30 | 31      | 33 |
 * 		+----+----+----+----+
 *
 * 		assertSelectedCells( model, [
 *			[ 0, 0, 0, 0 ],
 * 			[ 1,    1, 1 ],
 * 			[ 0, 0, 0, 0 ],
 *			[ 0, 0,    0 ]
 *		] );
 *
 * 		+----+----+----+----+
 * 		| 00 |[01]| 02 | 03 |
 * 		+----+    +----+----+
 * 		| 10 |    | 12 | 13 |
 * 		+----+----+----+----+
 * 		| 20 |[21]| 22 | 23 |
 * 		+----+----+----+----+
 * 		| 30 |[31]     | 33 |
 * 		+----+----+----+----+
 *
 * 		assertSelectedCells( model, [
 *			[ 0, 1, 0, 0 ],
 * 			[ 0,    0, 0 ],
 * 			[ 0, 1, 0, 0 ],
 *			[ 0, 1,    0 ]
 *		] );
 *
 */
export function assertSelectedCells( model, tableMap ) {
	const tableIndex = 0;

	for ( let rowIndex = 0; rowIndex < tableMap.length; rowIndex++ ) {
		const row = tableMap[ rowIndex ];

		for ( let cellIndex = 0; cellIndex < row.length; cellIndex++ ) {
			const expectSelected = row[ cellIndex ];

			if ( expectSelected ) {
				assertNodeIsSelected( model, [ tableIndex, rowIndex, cellIndex ] );
			} else {
				assertNodeIsNotSelected( model, [ tableIndex, rowIndex, cellIndex ] );
			}
		}
	}
}

function assertNodeIsSelected( model, path ) {
	const modelRoot = model.document.getRoot();
	const node = modelRoot.getNodeByPath( path );
	const selectionRanges = Array.from( model.document.selection.getRanges() );

	expect( selectionRanges.some( range => range.containsItem( node ) ), `Expected node [${ path }] to be selected` ).to.be.true;
}

function assertNodeIsNotSelected( model, path ) {
	const modelRoot = model.document.getRoot();
	const node = modelRoot.getNodeByPath( path );
	const selectionRanges = Array.from( model.document.selection.getRanges() );

	expect( selectionRanges.every( range => !range.containsItem( node ) ), `Expected node [${ path }] to be not selected` ).to.be.true;
}

// Formats table cell attributes
//
// @param {Object} attributes Attributes of a cell.
function formatAttributes( attributes ) {
	let attributesString = '';

	if ( attributes ) {
		const sortedKeys = Object.keys( attributes ).sort();

		if ( sortedKeys.length ) {
			attributesString = ' ' + sortedKeys.map( key => `${ key }="${ attributes[ key ] }"` ).join( ' ' );
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

				let attributes = {};

				if ( asWidget ) {
					attributes.class = getClassToSet( attributes );
					attributes.contenteditable = 'true';
				}

				if ( isObject ) {
					attributes = {
						...attributes,
						...tableCellData
					};
				}

				if ( !( contents.replace( '[', '' ).replace( ']', '' ).startsWith( '<' ) ) && enforceWrapping ) {
					const wrappingElementStart = wrappingElement == 'span' ?
						'span class="ck-table-bogus-paragraph"' : wrappingElement;

					contents =
						`<${ wrappingElementStart }>` +
						contents +
						`</${ wrappingElement }>`;
				}

				const formattedAttributes = formatAttributes( attributes );
				const tableCell = `<${ resultingCellElement }${ formattedAttributes }>${ contents }</${ resultingCellElement }>`;

				tableRowString += isSelected ? `[${ tableCell }]` : tableCell;

				return tableRowString;
			}, '' );

			return `${ previousRowsString }<${ rowElement }>${ tableRowString }</${ rowElement }>`;
		}, '' );
}

// Properly handles passed CSS class - editor do sort them.
function getClassToSet( attributes ) {
	return ( WIDGET_TABLE_CELL_CLASS + ( attributes.class ? ` ${ attributes.class }` : '' ) )
		.split( ' ' )
		.sort()
		.join( ' ' );
}

/**
 * Returns ascii-art visualization of the table.
 *
 * @param {module:engine/model/model~Model} model The editor model.
 * @param {module:engine/model/element~Element} table The table model element.
 * @returns {String}
 */
export function createTableAsciiArt( model, table ) {
	const tableMap = [ ...new TableWalker( table, { includeAllSlots: true } ) ];

	if ( !tableMap.length ) {
		return '';
	}

	const { row: lastRow, column: lastColumn } = tableMap[ tableMap.length - 1 ];
	const columns = lastColumn + 1;

	const headingRows = parseInt( table.getAttribute( 'headingRows' ) ) || 0;
	const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) ) || 0;

	let result = '';

	for ( let row = 0; row <= lastRow; row++ ) {
		let gridLine = '';
		let contentLine = '';

		for ( let column = 0; column <= lastColumn; column++ ) {
			const cellInfo = tableMap[ row * columns + column ];

			const isColSpan = cellInfo.cellAnchorColumn != cellInfo.column;
			const isRowSpan = cellInfo.cellAnchorRow != cellInfo.row;

			gridLine += !isColSpan || !isRowSpan ? '+' : ' ';
			gridLine += !isRowSpan ? '----' : '    ';

			let contents = getElementPlainText( model, cellInfo.cell ).substring( 0, 2 );
			contents += ' '.repeat( 2 - contents.length );

			contentLine += !isColSpan ? '|' : ' ';
			contentLine += !isColSpan && !isRowSpan ? ` ${ contents } ` : '    ';

			if ( column == lastColumn ) {
				gridLine += '+';
				contentLine += '|';

				if ( headingRows && row == headingRows ) {
					gridLine += ' <-- heading rows';
				}
			}
		}
		result += gridLine + '\n';
		result += contentLine + '\n';

		if ( row == lastRow ) {
			result += `+${ '----+'.repeat( columns ) }`;

			if ( headingRows && row == headingRows - 1 ) {
				result += ' <-- heading rows';
			}

			if ( headingColumns > 0 ) {
				result += `\n${ '     '.repeat( headingColumns ) }^-- heading columns`;
			}
		}
	}

	return result;
}

/**
 * Generates input data for `modelTable` helper method.
 *
 * @param {module:engine/model/model~Model} model The editor model.
 * @param {module:engine/model/element~Element} table The table model element.
 * @returns {Array.<Array.<String|Object>>}
 */
export function prepareModelTableInput( model, table ) {
	const result = [];
	let row = [];

	for ( const cellInfo of new TableWalker( table, { includeAllSlots: true } ) ) {
		if ( cellInfo.column == 0 && cellInfo.row > 0 ) {
			result.push( row );
			row = [];
		}

		if ( !cellInfo.isAnchor ) {
			continue;
		}

		const contents = getElementPlainText( model, cellInfo.cell );

		if ( cellInfo.cellWidth > 1 || cellInfo.cellHeight > 1 ) {
			row.push( {
				contents,
				...( cellInfo.cellWidth > 1 ? { colspan: cellInfo.cellWidth } : null ),
				...( cellInfo.cellHeight > 1 ? { rowspan: cellInfo.cellHeight } : null )
			} );
		} else {
			row.push( contents );
		}
	}

	result.push( row );

	return result;
}

/**
 * Pretty formats `modelTable` input data.
 *
 * @param {Array.<Array.<String|Object>>} data
 * @returns {String}
 */
export function prettyFormatModelTableInput( data ) {
	const rowsStringified = data.map( row => {
		const cellsStringified = row.map( cell => {
			if ( typeof cell == 'string' ) {
				return `'${ cell }'`;
			}

			const fieldsStringified = Object.entries( cell ).map( ( [ key, value ] ) => {
				return `${ key }: ${ typeof value == 'string' ? `'${ value }'` : value }`;
			} );

			return `{ ${ fieldsStringified.join( ', ' ) } }`;
		} );

		return '\t[ ' + cellsStringified.join( ', ' ) + ' ]';
	} );

	return `[\n${ rowsStringified.join( ',\n' ) }\n]`;
}

// Returns all the text content from element.
function getElementPlainText( model, element ) {
	return [ ...model.createRangeIn( element ).getWalker() ]
		.filter( ( { type } ) => type == 'text' )
		.map( ( { item: { data } } ) => data )
		.join( '' );
}
