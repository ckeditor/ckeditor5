/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableselection
 */

import TableWalker from './tablewalker';
import { findAncestor } from './commands/utils';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// TODO: refactor to an Observer
export default class TableSelection extends Plugin {
	constructor( editor ) {
		super( editor );

		this._isSelecting = false;
		this._highlighted = new Set();
	}

	init() {
		const editor = this.editor;
		this.tableUtils = editor.plugins.get( 'TableUtils' );

		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'keydown', () => {
			if ( this.isSelectingBlaBla() ) {
				this.stopSelection();
				const tableCell = this._startElement;
				this.clearSelection();

				editor.model.change( writer => {
					// Select the contents of table cell.
					writer.setSelection( tableCell, 'in' );
				} );
			}
		} );

		this.listenTo( viewDocument, 'mousedown', ( eventInfo, domEventData ) => {
			const tableCell = getTableCell( domEventData, this.editor );

			if ( !tableCell ) {
				this.stopSelection();
				this.clearSelection();

				return;
			}

			this._startSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'mousemove', ( eventInfo, domEventData ) => {
			if ( !this._isSelecting ) {
				return;
			}

			const tableCell = getTableCell( domEventData, this.editor );

			if ( !tableCell ) {
				return;
			}

			this._updateModelSelection( tableCell );

			if ( this.isSelectingBlaBla() ) {
				domEventData.preventDefault();

				this.redrawSelection();
			}
		} );

		this.listenTo( viewDocument, 'mouseup', ( eventInfo, domEventData ) => {
			if ( !this._isSelecting ) {
				return;
			}

			const tableCell = getTableCell( domEventData, this.editor );

			this.stopSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'mouseleave', () => {
			if ( !this._isSelecting ) {
				return;
			}

			this.stopSelection();
		} );
	}

	isSelectingBlaBla() {
		return this._isSelecting && this._startElement && this._endElement && this._startElement != this._endElement;
	}

	_startSelection( tableCell ) {
		this.clearSelection();
		this._isSelecting = true;
		this._startElement = tableCell;
		this._endElement = tableCell;
	}

	_updateModelSelection( tableCell ) {
		// Do not update if not in selection mode or no table cell passed.
		if ( !this._isSelecting || !tableCell ) {
			return;
		}

		const table = this._startElement.parent.parent;

		// Do not add tableCell to selection if it is from other table or is already set as end element.
		if ( table !== tableCell.parent.parent || this._endElement === tableCell ) {
			return;
		}

		const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );
		const startInHeading = this._startElement.parent.index < headingRows;
		const updateCellInHeading = tableCell.parent.index < headingRows;

		// Only add cell to selection if they are in the same table section.
		if ( startInHeading === updateCellInHeading ) {
			this._endElement = tableCell;
			this.redrawSelection();
		}
	}

	stopSelection( tableCell ) {
		if ( this._isSelecting && tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}

		this._isSelecting = false;
	}

	clearSelection() {
		this._startElement = undefined;
		this._endElement = undefined;
		this._isSelecting = false;
		this.clearPreviousSelection();
		this._highlighted.clear();
	}

	* getSelection() {
		if ( !this._startElement || !this._endElement ) {
			return;
		}

		yield* this._getBlockSelection();
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

	redrawSelection() {
		const editor = this.editor;
		const mapper = editor.editing.mapper;
		const view = editor.editing.view;
		const model = editor.model;

		const modelRanges = [];

		const selected = [ ...this.getSelection() ];
		const previous = [ ...this._highlighted.values() ];

		this._highlighted.clear();

		for ( const tableCell of selected ) {
			const viewElement = mapper.toViewElement( tableCell );
			modelRanges.push( model.createRangeOn( tableCell ) );

			this._highlighted.add( viewElement );
		}

		// Update model's selection
		model.change( writer => {
			writer.setSelection( modelRanges );
		} );

		view.change( writer => {
			for ( const previouslyHighlighted of previous ) {
				if ( !selected.includes( previouslyHighlighted ) ) {
					writer.removeClass( 'selected', previouslyHighlighted );
				}
			}

			for ( const currently of this._highlighted ) {
				writer.addClass( 'selected', currently );
			}
		} );
	}

	clearPreviousSelection() {
		const previous = [ ...this._highlighted.values() ];

		this.editor.editing.view.change( writer => {
			for ( const previouslyHighlighted of previous ) {
				writer.removeClass( 'selected', previouslyHighlighted );
			}
		} );
	}
}

function getTableCell( domEventData, editor ) {
	const element = domEventData.target;
	const modelElement = editor.editing.mapper.toModelElement( element );

	if ( !modelElement ) {
		return;
	}

	return findAncestor( 'tableCell', editor.model.createPositionAt( modelElement, 0 ) );
}

mix( TableSelection, ObservableMixin );
