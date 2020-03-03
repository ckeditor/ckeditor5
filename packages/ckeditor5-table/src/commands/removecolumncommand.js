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
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const firstCell = this._getReferenceCells().next().value;

		this.isEnabled = !!firstCell && tableUtils.getColumns( firstCell.parent.parent ) > 1;
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

		const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

		// Cache the table before removing or updating colspans.
		const tableMap = [ ...new TableWalker( table ) ];

		// Get column index of removed column.
		const firstCellData = tableMap.find( value => value.cell === firstCell );
		const selectionRow = firstCellData.row;
		const cellsToFocus = getCellToFocus( firstCell, lastCell );

		const removedColumnIndexes = {
			first: firstCellData.column,
			last: tableMap.find( value => value.cell === lastCell ).column
		};

		model.change( writer => {
			// A temporary workaround to avoid the "model-selection-range-intersects" error.
			writer.setSelection( writer.createSelection( table, 'on' ) );

			// Update heading columns attribute if removing a row from head section.
			if ( headingColumns && selectionRow <= headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns - 1, table );
			}

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
		if ( plugins.has( 'TableSelection' ) && plugins.get( 'TableSelection' ).hasMultiCellSelection ) {
			for ( const cell of plugins.get( 'TableSelection' ).getSelectedTableCells() ) {
				yield cell;
			}
		} else {
			const selection = this.editor.model.document.selection;

			yield findAncestor( 'tableCell', selection.getFirstPosition() );
		}
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
