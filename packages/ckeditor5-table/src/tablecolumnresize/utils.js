/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/utils
 */

/* istanbul ignore file */

import { global } from 'ckeditor5/src/utils';
import {
	COLUMN_WIDTH_PRECISION,
	COLUMN_MIN_WIDTH_AS_PERCENTAGE,
	COLUMN_MIN_WIDTH_IN_PIXELS
} from './constants';

/**
 * Collects all affected by the differ table model elements. The returned set may be empty.
 *
 * @param {Array.<module:engine/model/differ~DiffItem>} changes
 * @param {module:engine/model/model~Model} model
 * @returns {Set.<module:engine/model/element~Element>}
 */
export function getAffectedTables( changes, model ) {
	const tablesToProcess = new Set();

	for ( const change of changes ) {
		let referencePosition = null;

		// Checks if the particular change from the differ is:
		// - an insertion or removal of a table, a row or a cell,
		// - an attribute change on a table, a row or a cell.
		switch ( change.type ) {
			case 'insert':
			case 'remove':
				referencePosition = [ 'table', 'tableRow', 'tableCell' ].includes( change.name ) ?
					change.position :
					null;

				break;

			case 'attribute':
				if ( change.range.start.nodeAfter ) {
					referencePosition = [ 'table', 'tableRow', 'tableCell' ].includes( change.range.start.nodeAfter.name ) ?
						change.range.start :
						null;
				}

				break;
		}

		const affectedTables = [];

		if ( referencePosition ) {
			const tableNode = ( referencePosition.nodeAfter && referencePosition.nodeAfter.name === 'table' ) ?
				referencePosition.nodeAfter : referencePosition.findAncestor( 'table' );

			if ( tableNode ) {
				const range = model.createRangeOn( tableNode );

				for ( const node of range.getItems() ) {
					if ( node.is( 'element' ) && node.name === 'table' ) {
						affectedTables.push( node );
					}
				}
			}
		}

		const table = affectedTables;

		if ( table ) {
			for ( const tableItem of table ) {
				tablesToProcess.add( tableItem );
			}
		}
	}

	return tablesToProcess;
}

/**
 * Returns the computed width (in pixels) of the DOM element.
 *
 * @param {HTMLElement} domElement
 * @returns {Number}
 */
export function getElementWidthInPixels( domElement ) {
	return parseFloat( global.window.getComputedStyle( domElement ).width );
}

/**
 * Calculates the table width in pixels.
 *
 * @param {module:engine/model/element~Element} table
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Number}
 */
export function getTableWidthInPixels( table, editor ) {
	const viewTbody = getTbodyViewElement( table, editor );
	const domTbody = editor.editing.view.domConverter.mapViewToDom( viewTbody );

	return getElementWidthInPixels( domTbody );
}

/**
 * Calculates the column widths in pixels basing on the `columnWidths` table attribute:
 * - If the value for a given column is provided in pixels then it is just converted to a number and returned.
 * - Otherwise, it is assumed that unit is percentage and the column width is calculated proportionally to the whole table width.
 *
 * @param {module:engine/model/element~Element} table
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Array.<Number>}
 */
export function getColumnWidthsInPixels( table, editor ) {
	const tableWidthInPixels = getTableWidthInPixels( table, editor );

	return table.getAttribute( 'columnWidths' )
		.split( ',' )
		.map( columnWidth => columnWidth.trim() )
		.map( columnWidth => {
			return columnWidth.endsWith( 'px' ) ?
				parseFloat( columnWidth ) :
				parseFloat( columnWidth ) * tableWidthInPixels / 100;
		} );
}

/**
 * Calculates the percentage of the minimum column width given in pixels for a given table.
 *
 * @param {module:engine/model/element~Element} table
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Number}
 */
export function getColumnMinWidthAsPercentage( table, editor ) {
	const tableWidthInPixels = getTableWidthInPixels( table, editor );

	return COLUMN_MIN_WIDTH_IN_PIXELS * 100 / tableWidthInPixels;
}

/**
 * Returns the column indexes on the left and right edges of a cell.
 *
 * @param {module:engine/model/element~Element} cell
 * @returns {Object}
 */
export function getColumnIndex( cell, columnIndexMap ) {
	const cellColumnIndex = columnIndexMap.get( cell );
	const cellWidth = cell.getAttribute( 'colspan' ) || 1;

	return {
		leftEdge: cellColumnIndex,
		rightEdge: cellColumnIndex + cellWidth - 1
	};
}

/**
 * Returns the total number of columns in a table.
 *
 * @param {module:engine/model/element~Element} table
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Number}
 */
export function getNumberOfColumn( table, editor ) {
	return editor.plugins.get( 'TableUtils' ).getColumns( table );
}

/**
 * Checks if the table is already fully rendered, with the `<colgroup>` element that defines the widths for each column.
 *
 * @param {module:engine/model/element~Element} table
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Number}
 */
export function isTableRendered( table, editor ) {
	return !!getColgroupViewElement( table, editor );
}

// Returns the `<colgroup>` view element, if it exists in a table. Returns `undefined` otherwise.
//
// @private
// @param {module:engine/model/element~Element} table
// @param {module:core/editor/editor~Editor} editor
// @returns {module:engine/view/element~Element|undefined}
function getColgroupViewElement( table, editor ) {
	const viewFigure = editor.editing.mapper.toViewElement( table );
	const viewTable = [ ...viewFigure.getChildren() ].find( viewChild => viewChild.is( 'element', 'table' ) );

	return [ ...viewTable.getChildren() ].find( viewChild => viewChild.is( 'element', 'colgroup' ) );
}

// Returns the `<tbody>` view element, if it exists in a table. Returns `undefined` otherwise.
//
// @private
// @param {module:engine/model/element~Element} table
// @param {module:core/editor/editor~Editor} editor
// @returns {module:engine/view/element~Element|undefined}
function getTbodyViewElement( table, editor ) {
	const viewFigure = editor.editing.mapper.toViewElement( table );
	const viewTable = [ ...viewFigure.getChildren() ].find( viewChild => viewChild.is( 'element', 'table' ) );

	return [ ...viewTable.getChildren() ].find( viewChild => viewChild.is( 'element', 'tbody' ) );
}

/**
 * Rounds the provided value to a fixed-point number with defined number of digits after the decimal point.
 *
 * @param {Number|String} value
 * @returns {Number}
 */
export function toPrecision( value ) {
	const multiplier = Math.pow( 10, COLUMN_WIDTH_PRECISION );
	const number = parseFloat( value );

	return Math.round( number * multiplier ) / multiplier;
}

/**
 * Clamps the number within the inclusive lower (min) and upper (max) bounds. Returned number is rounded using the
 * {@link ~toPrecision `toPrecision()`} function.
 *
 * @param {Number} number
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function clamp( number, min, max ) {
	if ( number <= min ) {
		return toPrecision( min );
	}

	if ( number >= max ) {
		return toPrecision( max );
	}

	return toPrecision( number );
}

/**
 * Creates an array with defined length and fills all elements with defined value.
 *
 * @param {Number} length
 * @param {*} value
 * @returns {Array.<*>}
 */
export function fillArray( length, value ) {
	return Array( length ).fill( value );
}

/**
 * Sums all array values that can be parsed to a float.
 *
 * @param {Array.<Number>} array
 * @returns {Number}
 */
export function sumArray( array ) {
	return array
		.map( value => parseFloat( value ) )
		.filter( value => !Number.isNaN( value ) )
		.reduce( ( result, item ) => result + item, 0 );
}

/**
 * Makes sure that the sum of the widths from all columns is 100%. If the sum of all the widths is not equal 100%, all the widths are
 * changed proportionally so that they all sum back to 100%.
 *
 * Currently, only widths provided as percentage values are supported.
 *
 * @param {String} columnWidthsAttribute
 * @returns {Array.<Number>}
 */
export function normalizeColumnWidthsAttribute( columnWidthsAttribute ) {
	const columnWidths = prepareColumnWidths( columnWidthsAttribute );
	const totalWidth = sumArray( columnWidths );

	if ( totalWidth === 100 ) {
		return columnWidths;
	}

	return columnWidths
		// Adjust all the columns proportionally.
		.map( columnWidth => toPrecision( columnWidth * 100 / totalWidth ) )
		// Due to rounding of numbers it may happen that the sum of the widths of all columns will not be exactly 100%. Therefore, the width
		// of the last column is explicitly adjusted (narrowed or expanded), since all the columns have been proportionally changed already.
		.map( ( columnWidth, columnIndex, columnWidths ) => {
			const isLastColumn = columnIndex === columnWidths.length - 1;

			if ( !isLastColumn ) {
				return columnWidth;
			}

			const totalWidth = sumArray( columnWidths );

			return toPrecision( columnWidth + 100 - totalWidth );
		} );
}

// Initializes the column widths by parsing the attribute value and calculating the uninitialized column widths. The special value 'auto'
// indicates that width for the column must be calculated. The width of such uninitialized column is calculated as follows:
// - If there is enough free space in the table for all uninitialized columns to have at least the minimum allowed width for all of them,
//   then set this width equally for all uninitialized columns.
// - Otherwise, just set the minimum allowed width for all uninitialized columns. The sum of all column widths will be greater than 100%,
//   but then it will be adjusted proportionally to 100% in {@link #normalizeColumnWidthsAttribute `normalizeColumnWidthsAttribute()`}.
//
// @private
// @param {String} columnWidthsAttribute
// @returns {Array.<Number>}
function prepareColumnWidths( columnWidthsAttribute ) {
	const columnWidths = columnWidthsAttribute
		.split( ',' )
		.map( columnWidth => columnWidth.trim() );

	const numberOfUninitializedColumns = columnWidths.filter( columnWidth => columnWidth === 'auto' ).length;

	if ( numberOfUninitializedColumns === 0 ) {
		return columnWidths.map( columnWidth => toPrecision( columnWidth ) );
	}

	const totalWidthOfInitializedColumns = sumArray( columnWidths );

	const widthForUninitializedColumn = Math.max(
		( 100 - totalWidthOfInitializedColumns ) / numberOfUninitializedColumns,
		COLUMN_MIN_WIDTH_AS_PERCENTAGE
	);

	return columnWidths
		.map( columnWidth => columnWidth === 'auto' ? widthForUninitializedColumn : columnWidth )
		.map( columnWidth => toPrecision( columnWidth ) );
}

// Inserts column resizer element into a view cell.
//
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter View writer instance.
// @param {module:engine/view/element~Element} viewCell View cell.
export function insertColumnResizerElements( viewWriter, viewCell ) {
	let viewTableColumnResizerElement = [ ...viewCell.getChildren() ]
		.find( viewElement => viewElement.hasClass( 'table-column-resizer' ) );

	if ( viewTableColumnResizerElement ) {
		return;
	}

	viewTableColumnResizerElement = viewWriter.createUIElement( 'div', {
		class: 'table-column-resizer'
	} );

	viewWriter.insert(
		viewWriter.createPositionAt( viewCell, 'end' ),
		viewTableColumnResizerElement
	);
}

// Removes column resizer element from a view cell.
//
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter View writer instance.
// @param {module:engine/view/element~Element} viewCell View cell.
export function removeColumnResizerElements( viewWriter, viewCell ) {
	const viewTableColumnResizerElement = [ ...viewCell.getChildren() ]
		.find( viewElement => viewElement.hasClass( 'table-column-resizer' ) );

	if ( !viewTableColumnResizerElement ) {
		return;
	}

	viewWriter.remove( viewTableColumnResizerElement );
}
