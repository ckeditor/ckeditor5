/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/mergecellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import TableWalker from '../tablewalker';

/**
 * The merge cell command.
 *
 * @extends module:core/command~Command
 */
export default class MergeCellCommand extends Command {
	/**
	 * Creates a new `MergeCellCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} options.direction Indicates which cell to merge with the currently selected one.
	 * Possible values are: `'left'`, `'right'`, `'up'` and `'down'`.
	 */
	constructor( editor, options ) {
		super( editor );

		/**
		 * The direction that indicates which cell will be merged with the currently selected one.
		 *
		 * @readonly
		 * @member {String} #direction
		 */
		this.direction = options.direction;

		/**
		 * Whether the merge is horizontal (left/right) or vertical (up/down).
		 *
		 * @readonly
		 * @member {Boolean} #isHorizontal
		 */
		this.isHorizontal = this.direction == 'right' || this.direction == 'left';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const cellToMerge = this._getMergeableCell();

		this.isEnabled = !!cellToMerge;
		// In order to check if currently selected cell can be merged with one defined by #direction some computation are done beforehand.
		// As such we can cache it as a command's value.
		this.value = cellToMerge;
	}

	/**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #direction} value, it will merge the cell that is to the `'left'`, `'right'`, `'up'` or `'down'`.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const tableCell = doc.selection.getFirstPosition().parent;
		const cellToMerge = this.value;
		const direction = this.direction;

		model.change( writer => {
			const isMergeNext = direction == 'right' || direction == 'down';

			// The merge mechanism is always the same so sort cells to be merged.
			const cellToExpand = isMergeNext ? tableCell : cellToMerge;
			const cellToRemove = isMergeNext ? cellToMerge : tableCell;

			writer.move( Range.createIn( cellToRemove ), Position.createAt( cellToExpand, 'end' ) );
			writer.remove( cellToRemove );

			const spanAttribute = this.isHorizontal ? 'colspan' : 'rowspan';
			const cellSpan = parseInt( tableCell.getAttribute( spanAttribute ) || 1 );
			const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

			writer.setAttribute( spanAttribute, cellSpan + cellToMergeSpan, cellToExpand );

			writer.setSelection( Range.createIn( cellToExpand ) );
		} );
	}

	/**
	 * Returns a cell that can be merged with the current cell depending on the command's direction.
	 *
	 * @returns {module:engine/model/element|undefined}
	 * @private
	 */
	_getMergeableCell() {
		const model = this.editor.model;
		const doc = model.document;
		const element = doc.selection.getFirstPosition().parent;

		if ( !element.is( 'tableCell' ) ) {
			return;
		}

		// First get the cell on proper direction.
		const cellToMerge = this.isHorizontal ? getHorizontalCell( element, this.direction ) : getVerticalCell( element, this.direction );

		if ( !cellToMerge ) {
			return;
		}

		// If found check if the span perpendicular to merge direction is equal on both cells.
		const spanAttribute = this.isHorizontal ? 'rowspan' : 'colspan';
		const span = parseInt( element.getAttribute( spanAttribute ) || 1 );

		const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

		if ( cellToMergeSpan === span ) {
			return cellToMerge;
		}
	}
}

// Returns the cell that can be merged horizontally.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} direction
// @returns {module:engine/model/node~Node|null}
function getHorizontalCell( tableCell, direction ) {
	return direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;
}

// Returns the cell that can be merged vertically.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} direction
// @returns {module:engine/model/node~Node|null}
function getVerticalCell( tableCell, direction ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;

	const rowIndex = table.getChildIndex( tableRow );

	// Don't search for mergeable cell if direction points out of the table.
	if ( ( direction == 'down' && rowIndex === table.childCount - 1 ) || ( direction == 'up' && rowIndex === 0 ) ) {
		return;
	}

	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	// Don't search for mergeable cell if direction points out of the current table section.
	if ( headingRows && ( ( direction == 'down' && rowIndex === headingRows - 1 ) || ( direction == 'up' && rowIndex === headingRows ) ) ) {
		return;
	}

	const currentCellRowSpan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
	const rowOfCellToMerge = direction == 'down' ? rowIndex + currentCellRowSpan : rowIndex;

	const tableMap = [ ...new TableWalker( table, { endRow: rowOfCellToMerge } ) ];

	const currentCellData = tableMap.find( value => value.cell === tableCell );
	const mergeColumn = currentCellData.column;

	const cellToMergeData = tableMap.find( ( { row, rowspan, column } ) => {
		if ( column !== mergeColumn ) {
			return false;
		}

		if ( direction == 'down' ) {
			// If merging a cell below the mergeRow is already calculated.
			return row === rowOfCellToMerge;
		} else {
			// If merging a cell above calculate if it spans to mergeRow.
			return rowOfCellToMerge === row + rowspan;
		}
	} );

	return cellToMergeData && cellToMergeData.cell;
}
