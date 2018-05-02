/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/settableheaderscommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getParentTable } from './utils';
import TableWalker from '../tablewalker';
import Position from '../../../ckeditor5-engine/src/model/position';

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
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Number} [options.rows] Number of rows to set as headers.
	 * @param {Number} [options.columns] Number of columns to set as headers.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const rows = parseInt( options.rows ) || 0;
		const columns = parseInt( options.columns ) || 0;

		const table = getParentTable( selection.getFirstPosition() );

		model.change( writer => {
			const oldValue = parseInt( table.getAttribute( 'headingRows' ) || 0 );

			if ( oldValue !== rows && rows > 0 ) {
				const cellsToSplit = [];

				const startAnalysisRow = rows > oldValue ? oldValue : 0;

				for ( const tableWalkerValue of new TableWalker( table, { startRow: startAnalysisRow, endRow: rows } ) ) {
					const rowspan = tableWalkerValue.rowspan;
					const row = tableWalkerValue.row;

					if ( rowspan > 1 && row + rowspan > rows ) {
						cellsToSplit.push( tableWalkerValue );
					}
				}

				for ( const tableWalkerValue of cellsToSplit ) {
					splitVertically( tableWalkerValue.cell, rows, writer );
				}
			}

			updateTableAttribute( table, 'headingRows', rows, writer );
			updateTableAttribute( table, 'headingColumns', columns, writer );
		} );
	}
}

// @private
function updateTableAttribute( table, attributeName, newValue, writer ) {
	const currentValue = parseInt( table.getAttribute( attributeName ) || 0 );

	if ( newValue !== currentValue ) {
		if ( newValue > 0 ) {
			writer.setAttribute( attributeName, newValue, table );
		} else {
			writer.removeAttribute( attributeName, table );
		}
	}
}

/**
 * Splits table cell vertically.
 *
 * @param {module:engine/model/element} tableCell
 * @param {Number} headingRows
 * @param writer
 */
function splitVertically( tableCell, headingRows, writer ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const rowIndex = tableRow.index;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );
	const newRowspan = headingRows - rowIndex;

	const startRow = table.getChildIndex( tableRow );
	const endRow = startRow + newRowspan;

	const tableWalker = new TableWalker( table, { startRow, endRow, includeSpanned: true } );

	let columnIndex;
	let previousCell;

	const attributes = {};

	const spanToSet = rowspan - newRowspan;

	if ( spanToSet > 1 ) {
		attributes.rowspan = spanToSet;
	}

	const values = [ ...tableWalker ];

	for ( const tableWalkerInfo of values ) {
		if ( tableWalkerInfo.cell ) {
			previousCell = tableWalkerInfo.cell;
		}

		if ( tableWalkerInfo.cell === tableCell ) {
			columnIndex = tableWalkerInfo.column;

			if ( tableWalkerInfo.colspan > 1 ) {
				attributes.colspan = tableWalkerInfo.colspan;
			}
		}

		if ( columnIndex !== undefined && columnIndex === tableWalkerInfo.column && tableWalkerInfo.row === endRow ) {
			const insertRow = table.getChild( tableWalkerInfo.row );

			const position = previousCell.parent === insertRow ? Position.createAfter( previousCell ) : Position.createAt( insertRow );

			writer.insertElement( 'tableCell', attributes, position );
		}
	}

	// Update rowspan attribute after iterating over current table.
	if ( newRowspan > 1 ) {
		writer.setAttribute( 'rowspan', newRowspan, tableCell );
	} else {
		writer.removeAttribute( 'rowspan', tableCell );
	}
}
