/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/settableheaderscommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import { getParentTable, updateNumericAttribute } from './utils';
import TableWalker from '../tablewalker';

/**
 * The set table headers command.
 *
 * @extends module:core/command~Command
 */
export default class SetTableHeadersCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const tableParent = getParentTable( selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * @inheritDoc
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const rowsToSet = parseInt( options.rows ) || 0;

		const table = getParentTable( selection.getFirstPosition() );

		model.change( writer => {
			const currentHeadingRows = table.getAttribute( 'headingRows' ) || 0;

			if ( currentHeadingRows !== rowsToSet && rowsToSet > 0 ) {
				// Changing heading rows requires to check if any of a heading cell is overlaping vertically the table head.
				// Any table cell that has a rowspan attribute > 1 will not exceed the table head so we need to fix it in rows below.
				const cellsToSplit = getOverlappingCells( table, rowsToSet, currentHeadingRows );

				for ( const cell of cellsToSplit ) {
					splitHorizontally( cell, rowsToSet, writer );
				}
			}

			const columnsToSet = parseInt( options.columns ) || 0;
			updateTableAttribute( table, 'headingColumns', columnsToSet, writer );
			updateTableAttribute( table, 'headingRows', rowsToSet, writer );
		} );
	}
}

// Returns cells that span beyond new heading section.
//
// @param {module:engine/model/element~Element} table Table to check
// @param {Number} headingRowsToSet New heading rows attribute.
// @param {Number} currentHeadingRows Current heading rows attribute.
// @returns {Array.<module:engine/model/element~Element>}
function getOverlappingCells( table, headingRowsToSet, currentHeadingRows ) {
	const cellsToSplit = [];

	const startAnalysisRow = headingRowsToSet > currentHeadingRows ? currentHeadingRows : 0;

	const tableWalker = new TableWalker( table, { startRow: startAnalysisRow, endRow: headingRowsToSet } );

	for ( const { row, rowspan, cell } of tableWalker ) {
		if ( rowspan > 1 && row + rowspan > headingRowsToSet ) {
			cellsToSplit.push( cell );
		}
	}

	return cellsToSplit;
}

// @private
function updateTableAttribute( table, attributeName, newValue, writer ) {
	const currentValue = table.getAttribute( attributeName ) || 0;

	if ( newValue !== currentValue ) {
		updateNumericAttribute( attributeName, newValue, table, writer, 0 );
	}
}

// Splits table cell horizontally.
//
// @param {module:engine/model/element~Element} tableCell
// @param {Number} headingRows
// @param {module:engine/model/writer~Writer} writer
function splitHorizontally( tableCell, headingRows, writer ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const rowIndex = tableRow.index;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );
	const newRowspan = headingRows - rowIndex;

	const attributes = {};

	const spanToSet = rowspan - newRowspan;

	if ( spanToSet > 1 ) {
		attributes.rowspan = spanToSet;
	}

	const startRow = table.getChildIndex( tableRow );
	const endRow = startRow + newRowspan;
	const tableMap = [ ...new TableWalker( table, { startRow, endRow, includeSpanned: true } ) ];

	let columnIndex;

	for ( const { row, column, cell, colspan, cellIndex } of tableMap ) {
		if ( cell === tableCell ) {
			columnIndex = column;

			if ( colspan > 1 ) {
				attributes.colspan = colspan;
			}
		}

		if ( columnIndex !== undefined && columnIndex === column && row === endRow ) {
			const tableRow = table.getChild( row );

			writer.insertElement( 'tableCell', attributes, Position.createFromParentAndOffset( tableRow, cellIndex ) );
		}
	}

	// Update the rowspan attribute after updating table.
	updateNumericAttribute( 'rowspan', newRowspan, tableCell, writer );
}
