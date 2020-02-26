/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableWalker from './tablewalker';
import TableUtils from './tableutils';
import { setupTableSelectionHighlighting } from './tableselection/converters';
import MouseSelectionHandler from './tableselection/mouseselectionhandler';
import { findAncestor } from './commands/utils';
import { clearTableCellsContents } from './tableselection/utils';
import cropTable from './tableselection/croptable';

import '../theme/tableselection.css';

/**
 * The table selection plugin.
 *
 * It introduces the ability to select table cells. The table selection is described by two nodes: start and end.
 * Both are the oposite corners of an rectangle that spans over them.
 *
 * Consider a table:
 *
 *		    0   1   2   3
 *		  +---+---+---+---+
 *		0 | a | b | c | d |
 *		  +-------+   +---+
 *		1 | e | f |   | g |
 *		  +---+---+---+---+
 *		2 | h | i     | j |
 *		  +---+---+---+---+
 *
 * Setting the table selection start in table cell "b" and the end in table cell "g" will select table cells: "b", "c", "d", "f", and "g".
 * The cells that span over multiple rows or columns can extend over the selection rectangle. For instance, setting a selection from
 * the table cell "a" to the table cell "i" will create a selection in which the table cell "i" will be (partially) outside
 * the rectangle of selected cells: "a", "b", "e", "f", "h", and "i".
 *
 * @extends module:core/plugin~Plugin
 */
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

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A mouse selection handler.
		 *
		 * @private
		 * @readonly
		 * @member {module:table/tableselection/mouseselectionhandler~MouseSelectionHandler}
		 */
		this._mouseHandler = new MouseSelectionHandler( this, this.editor.editing );

		/**
		 * A reference to the table utilities used across the class.
		 *
		 * @private
		 * @readonly
		 * @member {module:table/tableutils~TableUtils} #_tableUtils
		 */
	}

	/**
	 * A flag indicating that there are selected table cells and the selection includes more than one table cell.
	 *
	 * @type {Boolean}
	 */
	get hasMultiCellSelection() {
		return !!this._startElement && !!this._endElement && this._startElement !== this._endElement;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const viewDoc = editor.editing.view.document;

		this._tableUtils = editor.plugins.get( 'TableUtils' );

		setupTableSelectionHighlighting( editor, this );

		this.listenTo( selection, 'change:range', () => this._clearSelectionOnExternalChange( selection ) );
		this.listenTo( viewDoc, 'delete', evt => {
			if ( this.hasMultiCellSelection ) {
				evt.stop();

				// TODO: why not deleteContent decorator???
				clearTableCellsContents( editor.model, this.getSelectedTableCells() );
			}
		}, { priority: 'high' } );

		this.listenTo( editor.model, 'deleteContent', ( evt, args ) => {
			const [ selection ] = args;

			if ( this.hasMultiCellSelection && selection.is( 'documentSelection' ) ) {
				evt.stop();

				clearTableCellsContents( this.editor.model, this.getSelectedTableCells() );

				editor.model.change( writer => {
					writer.setSelection( Array.from( this.getSelectedTableCells() ).pop(), 0 );
				} );
			}
		}, { priority: 'high' } );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();
		this._mouseHandler.stopListening();
	}

	/**
	 * Marks the table cell as a start of a table selection.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( tableCell );
	 *
	 * This method will clear the previous selection. The model selection will not be updated until
	 * the {@link #setSelectingTo} method is used.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 */
	startSelectingFrom( tableCell ) {
		this.clearSelection();

		this._startElement = tableCell;
		this._endElement = tableCell;
	}

	/**
	 * Updates the current table selection end element. Table selection is defined by a start and an end element.
	 * This method updates the end element. Must be preceded by {@link #startSelectingFrom}.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( startTableCell );
	 *
	 *		editor.plugins.get( 'TableSelection' ).setSelectingTo( endTableCell );
	 *
	 * This method will update model selection if start and end cells are different and belongs to the same table.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 */
	setSelectingTo( tableCell ) {
		if ( !this._startElement ) {
			this._startElement = tableCell;
		}

		const table = this._startElement.parent.parent;

		// Do not add tableCell to selection if it is from other table or is already set as end element.
		if ( table !== tableCell.parent.parent || this._endElement === tableCell ) {
			return;
		}

		this._endElement = tableCell;
		this._updateModelSelection();
	}

	/**
	 * Stops the selection process (but do not clear the current selection).
	 * The selection process is finished but the selection in the model remains.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( startTableCell );
	 *		editor.plugins.get( 'TableSelection' ).setSelectingTo( endTableCell );
	 *		editor.plugins.get( 'TableSelection' ).stopSelection();
	 *
	 * To clear the selection use {@link #clearSelection}.
	 *
	 * @param {module:engine/model/element~Element} [tableCell]
	 */
	stopSelection( tableCell ) {
		if ( tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}

		this._updateModelSelection();
	}

	/**
	 * Stops the current selection process and clears the table selection in the model.
	 *
	 *		editor.plugins.get( 'TableSelection' ).startSelectingFrom( startTableCell );
	 *		editor.plugins.get( 'TableSelection' ).setSelectingTo( endTableCell );
	 *		editor.plugins.get( 'TableSelection' ).stopSelection();
	 *
	 *		editor.plugins.get( 'TableSelection' ).clearSelection();
	 */
	clearSelection() {
		this._startElement = undefined;
		this._endElement = undefined;
	}

	/**
	 * Returns an iterator for selected table cells.
	 *
	 *		tableSelection.startSelectingFrom( startTableCell );
	 *		tableSelection.stopSelection( endTableCell );
	 *
	 *		const selectedTableCells = Array.from( tableSelection.getSelectedTableCells() );
	 *		// The above array will represent a rectangular table selection.
	 *
	 * @returns {Iterable.<module:engine/model/element~Element>}
	 */
	* getSelectedTableCells() {
		if ( !this.hasMultiCellSelection ) {
			return;
		}

		const startLocation = this._tableUtils.getCellLocation( this._startElement );
		const endLocation = this._tableUtils.getCellLocation( this._endElement );

		const startRow = Math.min( startLocation.row, endLocation.row );
		const endRow = Math.max( startLocation.row, endLocation.row );

		const startColumn = Math.min( startLocation.column, endLocation.column );
		const endColumn = Math.max( startLocation.column, endLocation.column );

		for ( const cellInfo of new TableWalker( findAncestor( 'table', this._startElement ), { startRow, endRow } ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				yield cellInfo.cell;
			}
		}
	}

	/**
	 * Returns selected table fragment as a document fragment.
	 *
	 * @returns {module:engine/model/documentfragment~DocumentFragment|undefined}
	 */
	getSelectionAsFragment() {
		if ( !this.hasMultiCellSelection ) {
			return;
		}

		return this.editor.model.change( writer => {
			const documentFragment = writer.createDocumentFragment();

			const table = cropTable( this.getSelectedTableCells(), this._tableUtils, writer );
			writer.insert( table, documentFragment, 0 );

			return documentFragment;
		} );
	}

	/**
	 * Synchronizes the model selection with currently selected table cells.
	 *
	 * @private
	 */
	_updateModelSelection() {
		if ( !this.hasMultiCellSelection ) {
			return;
		}

		const editor = this.editor;
		const model = editor.model;

		const modelRanges = [];

		for ( const tableCell of this.getSelectedTableCells() ) {
			modelRanges.push( model.createRangeOn( tableCell ) );
		}

		// Update model's selection
		model.change( writer => {
			writer.setSelection( modelRanges );
		} );
	}

	/**
	 * Checks if the selection has changed via an external change and if it is required to clear the internal state of the plugin.
	 *
	 * @param {module:engine/model/documentselection~DocumentSelection} selection
	 * @private
	 */
	_clearSelectionOnExternalChange( selection ) {
		if ( selection.rangeCount <= 1 && this.hasMultiCellSelection ) {
			this.clearSelection();
		}
	}
}
