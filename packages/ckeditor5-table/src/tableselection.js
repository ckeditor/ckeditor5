/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableediting
 */

import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import TableWalker from './tablewalker';
import TableUtils from './tableutils';
import { findAncestor } from './commands/utils';

export default class TableSelection extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableSelection';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableUtils ];
	}

	constructor( editor ) {
		super( editor );

		this._isSelecting = false;
		this._highlighted = new Set();

		this.editor = editor;
		this.tableUtils = editor.plugins.get( TableUtils );
	}

	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'mousedown', ( eventInfo, domEventData ) => {
			const tableCell = getTableCell( domEventData, this.editor );

			if ( !tableCell ) {
				return;
			}

			this.startSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'mousemove', ( eventInfo, domEventData ) => {
			if ( !this.isSelecting ) {
				return;
			}

			const tableCell = getTableCell( domEventData, this.editor );

			if ( !tableCell ) {
				return;
			}

			const wasOne = this.size === 1;

			this.updateSelection( tableCell );

			if ( this.size > 1 ) {
				domEventData.preventDefault();

				if ( wasOne ) {
					editor.editing.view.change( writer => {
						const viewElement = editor.editing.mapper.toViewElement( this._startElement );

						writer.setSelection( ViewRange.createIn( viewElement ), {
							fake: true,
							label: 'fake selection over table cell'
						} );
					} );
				}

				this.redrawSelection();
			}
		} );

		this.listenTo( viewDocument, 'mouseup', ( eventInfo, domEventData ) => {
			if ( !this.isSelecting ) {
				return;
			}

			const tableCell = getTableCell( domEventData, this.editor );

			this.stopSelection( tableCell );
		} );
	}

	get isSelecting() {
		return this._isSelecting;
	}

	get size() {
		return [ ...this.getSelection() ].length;
	}

	startSelection( tableCell ) {
		this.clearSelection();
		this._isSelecting = true;
		this._startElement = tableCell;
		this._endElement = tableCell;
	}

	updateSelection( tableCell ) {
		// Do not update if not in selection mode or no table cell passed.
		if ( !this.isSelecting || !tableCell ) {
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
		if ( this.isSelecting && tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
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

			for ( const currently of this._highlighted ) {
				writer.addClass( 'selected', currently );
			}

			// TODO works on FF ony... :|
			writer.setSelection( viewRanges, { fake: true, label: 'fake selection over table cell' } );
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

	return findAncestor( 'tableCell', Position.createAt( modelElement ) );
}
