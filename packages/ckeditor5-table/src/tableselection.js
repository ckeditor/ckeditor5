/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import MouseSelectionObserver from './tableselection/mouseselectionobserver';
import TableWalker from './tablewalker';
import { findAncestor } from './commands/utils';

/**
 * The table selection plugin.
 *
 * It introduces the ability to select table cells using mouse.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableSelection extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		this._isSelecting = false;
		this._highlighted = new Set();
	}

	/**
	 * a
	 * @returns {Boolean}
	 */
	get hasValidSelection() {
		return this._isSelecting && this._startElement && this._endElement && this._startElement != this._endElement;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		this.tableUtils = editor.plugins.get( 'TableUtils' );

		const viewDocument = editor.editing.view.document;

		editor.editing.view.addObserver( MouseSelectionObserver );

		this.listenTo( viewDocument, 'keydown', () => {
			if ( this.hasValidSelection ) {
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
			const tableCell = getModelTableCellFromViewEvent( domEventData, this.editor );

			if ( !tableCell ) {
				this.stopSelection();
				this.clearSelection();

				return;
			}

			this.startSelectingFrom( tableCell );
		} );

		this.listenTo( viewDocument, 'mousemove', ( eventInfo, domEventData ) => {
			if ( !this._isSelecting ) {
				return;
			}

			const tableCell = getModelTableCellFromViewEvent( domEventData, this.editor );

			if ( !tableCell ) {
				return;
			}

			this.setSelectingTo( tableCell );

			if ( this.hasValidSelection ) {
				domEventData.preventDefault();

				this.redrawSelection();
			}
		} );

		this.listenTo( viewDocument, 'mouseup', ( eventInfo, domEventData ) => {
			if ( !this._isSelecting ) {
				return;
			}

			const tableCell = getModelTableCellFromViewEvent( domEventData, this.editor );

			this.stopSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'mouseleave', () => {
			if ( !this._isSelecting ) {
				return;
			}

			this.stopSelection();
		} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;

			if ( this._isSelecting ) {
				this.clearPreviousSelection();

				for ( const tableCell of this.getSelection() ) {
					const viewElement = conversionApi.mapper.toViewElement( tableCell );

					viewWriter.addClass( 'selected', viewElement );
					this._highlighted.add( viewElement );
				}

				const ranges = viewSelection.getRanges();
				const from = Array.from( ranges );

				viewWriter.setSelection( from, { fake: true, label: 'TABLE' } );
			} else {
				this.clearPreviousSelection();
			}
		}, { priority: 'lowest' } ) );
	}

	/**
	 * Starts a selection process.
	 *
	 * This method enables the table selection process.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( tableCell );
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 */
	startSelectingFrom( tableCell ) {
		this.clearSelection();

		this._isSelecting = true;
		this._startElement = tableCell;
		this._endElement = tableCell;
	}

	/**
	 * Updates current table selection end element. Table selection is defined by #start and #end element.
	 * This method updates the #end element. Must be preceded by {@link #startSelectingFrom}.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( startTableCell );
	 *
	 *		editor.plugins.get( 'TableSelection' ).setSelectingTo( endTableCell );
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 */
	setSelectingTo( tableCell ) {
		// Do not update if not in selection mode or no table cell is passed.
		if ( !this._isSelecting || !tableCell ) {
			return;
		}

		const table = this._startElement.parent.parent;

		// Do not add tableCell to selection if it is from other table or is already set as end element.
		if ( table !== tableCell.parent.parent || this._endElement === tableCell ) {
			return;
		}

		this._endElement = tableCell;
		this.redrawSelection();
	}

	/**
	 * Stops selection process (but do not clear the current selection).
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 */
	stopSelection( tableCell ) {
		if ( this._isSelecting && tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}

		this._isSelecting = false;
	}

	/**
	 * Stops current selection process and clears table selection.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( startTableCell );
	 *
	 *		editor.plugins.get( 'TableSelection' ).setSelectingTo( endTableCell );
	 *
	 *		editor.plugins.get( 'TableSelection' ).clearSelection();
	 */
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
		const model = editor.model;

		const modelRanges = [];

		for ( const tableCell of this.getSelection() ) {
			modelRanges.push( model.createRangeOn( tableCell ) );
		}

		// Update model's selection
		model.change( writer => {
			writer.setSelection( modelRanges );
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

// Finds model table cell for given DOM event - ie. for 'mousedown'.
function getModelTableCellFromViewEvent( domEventData, editor ) {
	const viewTargetElement = domEventData.target;
	const modelElement = editor.editing.mapper.toModelElement( viewTargetElement );

	if ( !modelElement ) {
		return;
	}

	return findAncestor( 'tableCell', editor.model.createPositionAt( modelElement, 0 ) );
}
