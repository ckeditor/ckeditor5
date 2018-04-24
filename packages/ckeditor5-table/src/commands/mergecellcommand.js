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
	 * @param editor
	 * @param options
	 */
	constructor( editor, options ) {
		super( editor );

		this.direction = options.direction;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const cellToMerge = this._getCellToMerge();

		this.isEnabled = !!cellToMerge;
		this.value = cellToMerge;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const tableCell = doc.selection.getFirstPosition().parent;

		const siblingToMerge = this.value;

		model.change( writer => {
			const isMergeNext = this.direction == 'right' || this.direction == 'down';

			writer.move( Range.createIn( siblingToMerge ), Position.createAt( tableCell, isMergeNext ? 'end' : undefined ) );
			writer.remove( siblingToMerge );

			const spanAttribute = isHorizontal( this.direction ) ? 'colspan' : 'rowspan';

			const colspan = parseInt( tableCell.getAttribute( spanAttribute ) || 1 );
			const nextTableCellColspan = parseInt( siblingToMerge.getAttribute( spanAttribute ) || 1 );

			writer.setAttribute( spanAttribute, colspan + nextTableCellColspan, tableCell );
		} );
	}

	/**
	 * Returns a cell that it mergable with current cell depending on command's direction.
	 *
	 * @returns {*}
	 * @private
	 */
	_getCellToMerge() {
		const model = this.editor.model;
		const doc = model.document;
		const element = doc.selection.getFirstPosition().parent;

		if ( !element.is( 'tableCell' ) ) {
			return;
		}

		const cellToMerge = isHorizontal( this.direction ) ?
			getHorizontal( element, this.direction ) :
			getVertical( element, this.direction );

		if ( !cellToMerge ) {
			return;
		}

		const spanAttribute = isHorizontal( this.direction ) ? 'rowspan' : 'colspan';

		const span = parseInt( element.getAttribute( spanAttribute ) || 1 );

		const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

		if ( cellToMergeSpan === span ) {
			return cellToMerge;
		}

		function getVertical( tableCell, direction ) {
			const tableRow = tableCell.parent;
			const table = tableRow.parent;

			const rowIndex = table.getChildIndex( tableRow );

			if ( direction === 'down' && rowIndex === table.childCount - 1 ) {
				return;
			}

			const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

			const targetMergeRow = rowIndex + rowspan;

			const tableWalker = new TableWalker( table, { endRow: targetMergeRow } );

			const tableWalkerValues = [ ...tableWalker ];

			const cellData = tableWalkerValues.find( value => value.cell === tableCell );

			const cellToMerge = tableWalkerValues.find( value => {
				const row = value.row;
				const column = value.column;

				return column === cellData.column && ( targetMergeRow === row );
			} );

			const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

			if ( cellToMerge && cellToMerge.colspan === colspan ) {
				return cellToMerge.cell;
			}
		}

		function getHorizontal( tableCell, direction ) {
			return direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;
		}
	}
}

// @private
function isHorizontal( direction ) {
	return direction == 'right' || direction == 'left';
}
