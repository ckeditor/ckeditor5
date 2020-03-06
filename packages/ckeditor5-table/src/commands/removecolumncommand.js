/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removecolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { findAncestor, updateNumericAttribute } from './utils';

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
		const firstCell = this._getReferenceCells().next().value;

		if ( firstCell ) {
			const table = firstCell.parent.parent;
			const tableUtils = this.editor.plugins.get( 'TableUtils' );
			const tableColumnCount = table && tableUtils.getColumns( table );

			const tableMap = [ ...new TableWalker( table ) ];
			const selectedCells = Array.from( this._getReferenceCells() );
			const columnIndexes = tableMap.filter( entry => selectedCells.includes( entry.cell ) ).map( el => el.column );

			this.isEnabled = Math.max.apply( null, columnIndexes ) - Math.min.apply( null, columnIndexes ) < ( tableColumnCount - 1 );
		} else {
			this.isEnabled = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;

		const referenceCells = Array.from( this._getReferenceCells() );
		const firstCell = referenceCells[ 0 ];
		const lastCell = referenceCells[ referenceCells.length - 1 ];
		const tableRow = firstCell.parent;
		const table = tableRow.parent;

		// Cache the table before removing or updating colspans.
		const tableMap = [ ...new TableWalker( table ) ];

		// Get column index of removed column.
		const firstCellData = tableMap.find( value => value.cell === firstCell );
		const cellsToFocus = getCellToFocus( firstCell, lastCell );

		const removedColumnIndexes = {
			first: firstCellData.column,
			last: tableMap.find( value => value.cell === lastCell ).column
		};

		model.change( writer => {
			// A temporary workaround to avoid the "model-selection-range-intersects" error.
			writer.setSelection( writer.createSelection( table, 'on' ) );

			adjustHeadingColumns( table, removedColumnIndexes, writer );

			for (
				let removedColumnIndex = removedColumnIndexes.last;
				removedColumnIndex >= removedColumnIndexes.first;
				removedColumnIndex--
			) {
				for ( const { cell, column, colspan } of tableMap ) {
					// If colspaned cell overlaps removed column decrease it's span.
					if ( column <= removedColumnIndex && colspan > 1 && column + colspan > removedColumnIndex ) {
						updateNumericAttribute( 'colspan', colspan - 1, cell, writer );
					} else if ( column === removedColumnIndex ) {
						// The cell in removed column has colspan of 1.
						writer.remove( cell );
					}
				}
			}

			writer.setSelection( writer.createPositionAt( cellsToFocus.reverse().filter( item => item != null )[ 0 ], 0 ) );
		} );
	}

	/**
	 * Returns cells that are selected and are a reference to removing rows.
	 *
	 * @private
	 * @returns {Iterable.<module:engine/model/element~Element>} Generates `tableCell` elements.
	 */
	* _getReferenceCells() {
		const plugins = this.editor.plugins;
		if ( plugins.has( 'TableSelection' ) ) {
			const selectedCells = plugins.get( 'TableSelection' ).getSelectedTableCells();

			if ( selectedCells ) {
				for ( const cell of selectedCells ) {
					yield cell;
				}

				return;
			}
		}

		const selection = this.editor.model.document.selection;
		yield findAncestor( 'tableCell', selection.getFirstPosition() );
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

// Returns a proper table cell to focus after removing a column. It should be a next sibling to selection visually stay in place but:
// - selection is on last table cell it will return previous cell.
// - table cell is spanned over 2+ columns - it will be truncated so the selection should stay in that cell.
function getCellToFocus( firstCell, lastCell ) {
	const colspan = parseInt( lastCell.getAttribute( 'colspan' ) || 1 );

	if ( colspan > 1 ) {
		return [ firstCell, lastCell ];
	}

	// return lastCell.nextSibling ? lastCell.nextSibling : lastCell.previousSibling;
	return [ firstCell.previousSibling, lastCell.nextSibling ];
}
