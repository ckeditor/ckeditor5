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
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} options.direction Indicates which cell merge to currently selected one.
	 * Possible values are: "left", "right", "up" and "down".
	 */
	constructor( editor, options ) {
		super( editor );

		/**
		 * The direction indicates which cell will be merged to currently selected one.
		 *
		 * @readonly
		 * @member {String} module:table/commands/insertrowcommand~InsertRowCommand#order
		 */
		this.direction = options.direction;
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
	 * @inheritDoc
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
			const mergeInto = isMergeNext ? tableCell : cellToMerge;
			const removeCell = isMergeNext ? cellToMerge : tableCell;

			writer.move( Range.createIn( removeCell ), Position.createAt( mergeInto, 'end' ) );
			writer.remove( removeCell );

			const spanAttribute = isHorizontal( direction ) ? 'colspan' : 'rowspan';
			const cellSpan = parseInt( tableCell.getAttribute( spanAttribute ) || 1 );
			const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

			writer.setAttribute( spanAttribute, cellSpan + cellToMergeSpan, mergeInto );

			writer.setSelection( Range.createIn( mergeInto ) );
		} );
	}

	/**
	 * Returns a cell that is mergeable with current cell depending on command's direction.
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
		const cellToMerge = isHorizontal( this.direction ) ?
			getHorizontalCell( element, this.direction ) :
			getVerticalCell( element, this.direction );

		if ( !cellToMerge ) {
			return;
		}

		// If found check if the span perpendicular to merge direction is equal on both cells.
		const spanAttribute = isHorizontal( this.direction ) ? 'rowspan' : 'colspan';
		const span = parseInt( element.getAttribute( spanAttribute ) || 1 );

		const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

		if ( cellToMergeSpan === span ) {
			return cellToMerge;
		}
	}
}

// Checks whether merge direction is horizontal.
//
// returns {Boolean}
function isHorizontal( direction ) {
	return direction == 'right' || direction == 'left';
}

// Returns horizontally mergeable cell.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} direction
// @returns {module:engine/model/node~Node|null}
function getHorizontalCell( tableCell, direction ) {
	return direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;
}

// Returns vertically mergeable cell.
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

	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

	// Don't search for mergeable cell if direction points out of the current table section.
	if ( headingRows && ( ( direction == 'down' && rowIndex === headingRows - 1 ) || ( direction == 'up' && rowIndex === headingRows ) ) ) {
		return;
	}

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
	const mergeRow = direction == 'down' ? rowIndex + rowspan : rowIndex;

	const tableMap = [ ...new TableWalker( table, { endRow: mergeRow } ) ];

	const currentCellData = tableMap.find( value => value.cell === tableCell );
	const mergeColumn = currentCellData.column;

	const cellToMergeData = tableMap.find( ( { row, column } ) => {
		return column === mergeColumn && ( direction == 'down' ? mergeRow === row : mergeRow === rowspan + row );
	} );

	return cellToMergeData && cellToMergeData.cell;
}
