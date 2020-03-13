/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removecolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { updateNumericAttribute } from './utils';
import { getSelectionAffectedTableCells } from '../utils';

/**
 * The remove column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableColumn'` editor command.
 *
 * To remove the column containing the selected cell, execute the command:
 *
 *		editor.execute( 'removeTableColumn' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selectedCells = getSelectionAffectedTableCells( this.editor.model.document.selection );
		const firstCell = selectedCells[ 0 ];

		if ( firstCell ) {
			const table = firstCell.parent.parent;
			const tableColumnCount = this.editor.plugins.get( 'TableUtils' ).getColumns( table );

			const tableMap = [ ...new TableWalker( table ) ];
			const columnIndexes = tableMap.filter( entry => selectedCells.includes( entry.cell ) ).map( el => el.column ).sort();
			const minColumnIndex = columnIndexes[ 0 ];
			const maxColumnIndex = columnIndexes[ columnIndexes.length - 1 ];

			this.isEnabled = maxColumnIndex - minColumnIndex < ( tableColumnCount - 1 );
		} else {
			this.isEnabled = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const [ firstCell, lastCell ] = getBoundaryCells( this.editor.model.document.selection );
		const table = firstCell.parent.parent;

		// Cache the table before removing or updating colspans.
		const tableMap = [ ...new TableWalker( table ) ];

		// Store column indexes of removed columns.
		const removedColumnIndexes = {
			first: tableMap.find( value => value.cell === firstCell ).column,
			last: tableMap.find( value => value.cell === lastCell ).column
		};

		const cellToFocus = getCellToFocus( tableMap, firstCell, lastCell, removedColumnIndexes );

		this.editor.model.change( writer => {
			// A temporary workaround to avoid the "model-selection-range-intersects" error.
			writer.setSelection( writer.createRangeOn( table ) );

			adjustHeadingColumns( table, removedColumnIndexes, writer );

			for (
				let removedColumnIndex = removedColumnIndexes.last;
				removedColumnIndex >= removedColumnIndexes.first;
				removedColumnIndex--
			) {
				for ( const { cell, column, colspan } of tableMap ) {
					// If colspaned cell overlaps removed column decrease its span.
					if ( column <= removedColumnIndex && colspan > 1 && column + colspan > removedColumnIndex ) {
						updateNumericAttribute( 'colspan', colspan - 1, cell, writer );
					} else if ( column === removedColumnIndex ) {
						const cellRow = cell.parent;

						// The cell in removed column has colspan of 1.
						writer.remove( cell );

						// If the cell was the last one in the row, get rid of the entire row.
						// https://github.com/ckeditor/ckeditor5/issues/6429
						if ( !cellRow.childCount ) {
							writer.remove( cellRow );
						}
					}
				}
			}

			writer.setSelection( writer.createPositionAt( cellToFocus, 0 ) );
		} );
	}
}

// Updates heading columns attribute if removing a row from head section.
function adjustHeadingColumns( table, removedColumnIndexes, writer ) {
	const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

	if ( headingColumns && removedColumnIndexes.first <= headingColumns ) {
		const headingsRemoved = Math.min( headingColumns - 1 /* Other numbers are 0-based */, removedColumnIndexes.last ) -
			removedColumnIndexes.first + 1;

		writer.setAttribute( 'headingColumns', headingColumns - headingsRemoved, table );
	}
}

// Returns a proper table cell to focus after removing a column.
// - selection is on last table cell it will return previous cell.
function getCellToFocus( tableMap, firstCell, lastCell, removedColumnIndexes ) {
	const colspan = parseInt( lastCell.getAttribute( 'colspan' ) || 1 );

	// If the table cell is spanned over 2+ columns - it will be truncated so the selection should
	// stay in that cell.
	if ( colspan > 1 ) {
		return lastCell;
	}
	// Normally, look for the cell in the same row that precedes the first cell to put selection there ("column on the left").
	// If the deleted column is the first column of the table, there will be no predecessor: use the cell
	// from the column that follows then (also in the same row).
	else if ( firstCell.previousSibling || lastCell.nextSibling ) {
		return lastCell.nextSibling || firstCell.previousSibling;
	}
	// It can happen that table cells have no siblings in a row, for instance, when there are row spans
	// in the table (in the previous row). Then just look for the closest cell that is in a column
	// that will not be removed to put the selection there.
	else {
		// Look for any cell in a column that precedes the first removed column.
		if ( removedColumnIndexes.first ) {
			return tableMap.reverse().find( ( { column } ) => {
				return column < removedColumnIndexes.first;
			} ).cell;
		}
		// If the first removed column is the first column of the table, then
		// look for any cell that is in a column that follows the last removed column.
		else {
			return tableMap.reverse().find( ( { column } ) => {
				return column > removedColumnIndexes.last;
			} ).cell;
		}
	}
}

// Returns helper object returning the first and the last cell contained in given selection, based on DOM order.
function getBoundaryCells( selection ) {
	const referenceCells = getSelectionAffectedTableCells( selection );
	const firstCell = referenceCells[ 0 ];
	const lastCell = referenceCells.pop();

	const returnValue = [ firstCell, lastCell ];

	return firstCell.isBefore( lastCell ) ? returnValue : returnValue.reverse();
}
