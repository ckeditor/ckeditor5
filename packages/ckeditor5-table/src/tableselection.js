/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableediting
 */

import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import TableWalker from './tablewalker';

export default class TableSelection {
	constructor( editor, tableUtils ) {
		// block | column | row
		this._mode = 'block';
		this._isSelecting = false;
		this._highlighted = new Set();

		this.editor = editor;
		this.tableUtils = tableUtils;
	}

	get isSelecting() {
		return this._isSelecting;
	}

	startSelection( tableCell, mode = 'block' ) {
		this.clearSelection();
		this._isSelecting = true;
		this._startElement = tableCell;
		this._endElement = tableCell;
		this._mode = mode;
		this._redrawSelection();
	}

	updateSelection( tableCell ) {
		if ( tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}
		this._redrawSelection();
	}

	stopSelection( tableCell ) {
		this._isSelecting = false;

		if ( tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}

		this._redrawSelection();
	}

	clearSelection() {
		this._startElement = undefined;
		this._endElement = undefined;
		this._isSelecting = false;
		this.updateSelection();
		this._highlighted.clear();
	}

	* getSelection() {
		if ( !this._startElement || !this._endElement ) {
			return [];
		}

		// return selection according to the mode
		if ( this._mode == 'block' ) {
			yield* this._getBlockSelection();
		}

		if ( this._mode == 'row' ) {
			yield* this._getRowSelection();
		}

		if ( this._mode == 'column' ) {
			yield* this._getColumnSelection();
		}

		return [];
	}

	* _getBlockSelection() {
		const startLocation = this.tableUtils.getCellLocation( this._startElement );
		const endLocation = this.tableUtils.getCellLocation( this._endElement );

		const startRow = startLocation.row > endLocation.row ? endLocation.row : startLocation.row;
		const endRow = startLocation.row > endLocation.row ? startLocation.row : endLocation.row;

		const startColumn = startLocation.column > endLocation.column ? endLocation.column : startLocation.column;
		const endColumn = startLocation.column > endLocation.column ? startLocation.column : endLocation.column;

		for ( const cellInfo of new TableWalker( this._startElement.parent.parent, { startRow, endRow } ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				yield cellInfo.cell;
			}
		}
	}

	* _getRowSelection() {
		const startLocation = this.tableUtils.getCellLocation( this._startElement );
		const endLocation = this.tableUtils.getCellLocation( this._endElement );

		const startRow = startLocation.row > endLocation.row ? endLocation.row : startLocation.row;
		const endRow = startLocation.row > endLocation.row ? startLocation.row : endLocation.row;

		for ( const cellInfo of new TableWalker( this._startElement.parent.parent, { startRow, endRow } ) ) {
			yield cellInfo.cell;
		}
	}

	* _getColumnSelection() {
		const startLocation = this.tableUtils.getCellLocation( this._startElement );
		const endLocation = this.tableUtils.getCellLocation( this._endElement );

		const startColumn = startLocation.column > endLocation.column ? endLocation.column : startLocation.column;
		const endColumn = startLocation.column > endLocation.column ? startLocation.column : endLocation.column;

		for ( const cellInfo of new TableWalker( this._startElement.parent.parent ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				yield cellInfo.cell;
			}
		}
	}

	_redrawSelection() {
		const viewRanges = [];

		const selected = [ ...this.getSelection() ];
		const previous = [ ...this._highlighted.values() ];

		this._highlighted.clear();

		for ( const tableCell of selected ) {
			const viewElement = this.editor.editing.mapper.toViewElement( tableCell );
			viewRanges.push( ViewRange.createOn( viewElement ) );

			this._highlighted.add( viewElement );
		}

		this.editor.editing.view.change( writer => {
			for ( const previouslyHighlighted of previous ) {
				if ( !selected.includes( previouslyHighlighted ) ) {
					writer.removeClass( 'selected', previouslyHighlighted );
				}
			}

			writer.setSelection( viewRanges, { fake: true, label: 'fake selection over table cell' } );
		} );
	}
}
