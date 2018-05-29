/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/setheaderrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import { getParentTable, updateNumericAttribute } from './utils';
import TableWalker from '../tablewalker';

/**
 * The header row command.
 *
 * @extends module:core/command~Command
 */
export default class SetHeaderRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const position = selection.getFirstPosition();
		const tableParent = getParentTable( position );

		this.isEnabled = !!tableParent;

		this.value = this.isEnabled && this._isInHeading( position.parent, tableParent );
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const position = selection.getFirstPosition();
		const tableCell = position.parent;
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const currentHeadingRows = table.getAttribute( 'headingRows' ) || 0;
		const rowIndex = tableRow.index;

		const rowsToSet = rowIndex + 1 !== currentHeadingRows ? rowIndex + 1 : rowIndex;

		model.change( writer => {
			if ( rowsToSet ) {
				// Changing heading rows requires to check if any of a heading cell is overlaping vertically the table head.
				// Any table cell that has a rowspan attribute > 1 will not exceed the table head so we need to fix it in rows below.
				const cellsToSplit = getOverlappingCells( table, rowsToSet, currentHeadingRows );

				for ( const cell of cellsToSplit ) {
					splitHorizontally( cell, rowsToSet, writer );
				}
			}

			updateNumericAttribute( 'headingRows', rowsToSet, table, writer, 0 );
		} );
	}

	/**
	 * Checks if table cell is in heading section.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {module:engine/model/element~Element} table
	 * @returns {Boolean}
	 * @private
	 */
	_isInHeading( tableCell, table ) {
		const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

		return !!headingRows && tableCell.parent.index < headingRows;
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
