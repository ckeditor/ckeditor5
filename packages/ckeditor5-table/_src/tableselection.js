/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection
 */

import { Plugin } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

import TableWalker from './tablewalker';
import TableUtils from './tableutils';

import { cropTableToDimensions, adjustLastRowIndex, adjustLastColumnIndex } from './utils/structure';

import '../theme/tableselection.css';

/**
 * This plugin enables the advanced table cells, rows and columns selection.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
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
		return [ TableUtils, TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;

		this.listenTo( model, 'deleteContent', ( evt, args ) => this._handleDeleteContent( evt, args ), { priority: 'high' } );
		this.listenTo( view.document, 'insertText', ( evt, data ) => this._handleInsertTextEvent( evt, data ), { priority: 'high' } );

		this._defineSelectionConverter();
		this._enablePluginDisabling(); // sic!
	}

	/**
	 * Returns the currently selected table cells or `null` if it is not a table cells selection.
	 *
	 * @returns {Array.<module:engine/model/element~Element>|null}
	 */
	getSelectedTableCells() {
		const tableUtils = this.editor.plugins.get( TableUtils );
		const selection = this.editor.model.document.selection;

		const selectedCells = tableUtils.getSelectedTableCells( selection );

		if ( selectedCells.length == 0 ) {
			return null;
		}

		// This should never happen, but let's know if it ever happens.
		// @if CK_DEBUG //	/* istanbul ignore next */
		// @if CK_DEBUG //	if ( selectedCells.length != selection.rangeCount ) {
		// @if CK_DEBUG //		console.warn( 'Mixed selection warning. The selection contains table cells and some other ranges.' );
		// @if CK_DEBUG //	}

		return selectedCells;
	}

	/**
	 * Returns the selected table fragment as a document fragment.
	 *
	 * @returns {module:engine/model/documentfragment~DocumentFragment|null}
	 */
	getSelectionAsFragment() {
		const tableUtils = this.editor.plugins.get( TableUtils );
		const selectedCells = this.getSelectedTableCells();

		if ( !selectedCells ) {
			return null;
		}

		return this.editor.model.change( writer => {
			const documentFragment = writer.createDocumentFragment();

			const { first: firstColumn, last: lastColumn } = tableUtils.getColumnIndexes( selectedCells );
			const { first: firstRow, last: lastRow } = tableUtils.getRowIndexes( selectedCells );

			const sourceTable = selectedCells[ 0 ].findAncestor( 'table' );

			let adjustedLastRow = lastRow;
			let adjustedLastColumn = lastColumn;

			// If the selection is rectangular there could be a case of all cells in the last row/column spanned over
			// next row/column so the real lastRow/lastColumn should be updated.
			if ( tableUtils.isSelectionRectangular( selectedCells ) ) {
				const dimensions = {
					firstColumn,
					lastColumn,
					firstRow,
					lastRow
				};

				adjustedLastRow = adjustLastRowIndex( sourceTable, dimensions );
				adjustedLastColumn = adjustLastColumnIndex( sourceTable, dimensions );
			}

			const cropDimensions = {
				startRow: firstRow,
				startColumn: firstColumn,
				endRow: adjustedLastRow,
				endColumn: adjustedLastColumn
			};

			const table = cropTableToDimensions( sourceTable, cropDimensions, writer );

			writer.insert( table, documentFragment, 0 );

			return documentFragment;
		} );
	}

	/**
	 * Sets the model selection based on given anchor and target cells (can be the same cell).
	 * Takes care of setting the backward flag.
	 *
	 *		const modelRoot = editor.model.document.getRoot();
	 *		const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
	 *		const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
	 *
	 *		const tableSelection = editor.plugins.get( 'TableSelection' );
	 *		tableSelection.setCellSelection( firstCell, lastCell );
	 *
	 * @param {module:engine/model/element~Element} anchorCell
	 * @param {module:engine/model/element~Element} targetCell
	 */
	setCellSelection( anchorCell, targetCell ) {
		const cellsToSelect = this._getCellsToSelect( anchorCell, targetCell );

		this.editor.model.change( writer => {
			writer.setSelection(
				cellsToSelect.cells.map( cell => writer.createRangeOn( cell ) ),
				{ backward: cellsToSelect.backward }
			);
		} );
	}

	/**
	 * Returns the focus cell from the current selection.
	 *
	 * @returns {module:engine/model/element~Element}
	 */
	getFocusCell() {
		const selection = this.editor.model.document.selection;
		const focusCellRange = [ ...selection.getRanges() ].pop();
		const element = focusCellRange.getContainedElement();

		if ( element && element.is( 'element', 'tableCell' ) ) {
			return element;
		}

		return null;
	}

	/**
	 * Returns the anchor cell from the current selection.
	 *
	 * @returns {module:engine/model/element~Element} anchorCell
	 */
	getAnchorCell() {
		const selection = this.editor.model.document.selection;
		const anchorCellRange = first( selection.getRanges() );
		const element = anchorCellRange.getContainedElement();

		if ( element && element.is( 'element', 'tableCell' ) ) {
			return element;
		}

		return null;
	}

	/**
	 * Defines a selection converter which marks the selected cells with a specific class.
	 *
	 * The real DOM selection is put in the last cell. Since the order of ranges is dependent on whether the
	 * selection is backward or not, the last cell will usually be close to the "focus" end of the selection
	 * (a selection has anchor and focus).
	 *
	 * The real DOM selection is then hidden with CSS.
	 *
	 * @private
	 */
	_defineSelectionConverter() {
		const editor = this.editor;
		const highlighted = new Set();

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;

			clearHighlightedTableCells( viewWriter );

			const selectedCells = this.getSelectedTableCells();

			if ( !selectedCells ) {
				return;
			}

			for ( const tableCell of selectedCells ) {
				const viewElement = conversionApi.mapper.toViewElement( tableCell );

				viewWriter.addClass( 'ck-editor__editable_selected', viewElement );
				highlighted.add( viewElement );
			}

			const lastViewCell = conversionApi.mapper.toViewElement( selectedCells[ selectedCells.length - 1 ] );
			viewWriter.setSelection( lastViewCell, 0 );
		}, { priority: 'lowest' } ) );

		function clearHighlightedTableCells( writer ) {
			for ( const previouslyHighlighted of highlighted ) {
				writer.removeClass( 'ck-editor__editable_selected', previouslyHighlighted );
			}

			highlighted.clear();
		}
	}

	/**
	 * Creates a listener that reacts to changes in {@link #isEnabled} and, if the plugin was disabled,
	 * it collapses the multi-cell selection to a regular selection placed inside a table cell.
	 *
	 * This listener helps features that disable the table selection plugin bring the selection
	 * to a clear state they can work with (for instance, because they don't support multiple cell selection).
	 */
	_enablePluginDisabling() {
		const editor = this.editor;

		this.on( 'change:isEnabled', () => {
			if ( !this.isEnabled ) {
				const selectedCells = this.getSelectedTableCells();

				if ( !selectedCells ) {
					return;
				}

				editor.model.change( writer => {
					const position = writer.createPositionAt( selectedCells[ 0 ], 0 );
					const range = editor.model.schema.getNearestSelectionRange( position );

					writer.setSelection( range );
				} );
			}
		} );
	}

	/**
	 * Overrides the default `model.deleteContent()` behavior over a selected table fragment.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} event
	 * @param {Array.<*>} args Delete content method arguments.
	 */
	_handleDeleteContent( event, args ) {
		const tableUtils = this.editor.plugins.get( TableUtils );
		const [ selection, options ] = args;
		const model = this.editor.model;
		const isBackward = !options || options.direction == 'backward';
		const selectedTableCells = tableUtils.getSelectedTableCells( selection );

		if ( !selectedTableCells.length ) {
			return;
		}

		event.stop();

		model.change( writer => {
			const tableCellToSelect = selectedTableCells[ isBackward ? selectedTableCells.length - 1 : 0 ];

			model.change( writer => {
				for ( const tableCell of selectedTableCells ) {
					model.deleteContent( writer.createSelection( tableCell, 'in' ) );
				}
			} );

			const rangeToSelect = model.schema.getNearestSelectionRange( writer.createPositionAt( tableCellToSelect, 0 ) );

			// Note: we ignore the case where rangeToSelect may be null because deleteContent() will always (unless someone broke it)
			// create an empty paragraph to accommodate the selection.

			if ( selection.is( 'documentSelection' ) ) {
				writer.setSelection( rangeToSelect );
			} else {
				selection.setTo( rangeToSelect );
			}
		} );
	}

	/**
	 * This handler makes it possible to remove the content of all selected cells by starting to type.
	 * If you take a look at {@link #_defineSelectionConverter} you will find out that despite the multi-cell selection being set
	 * in the model, the view selection is collapsed in the last cell (because most browsers are unable to render multi-cell selections;
	 * yes, it's a hack).
	 *
	 * When multiple cells are selected in the model and the user starts to type, the
	 * {@link module:engine/view/document~Document#event:insertText} event carries information provided by the
	 * beforeinput DOM  event, that in turn only knows about this collapsed DOM selection in the last cell.
	 *
	 * As a result, the selected cells have no chance to be cleaned up. To fix this, this listener intercepts
	 * the event and injects the custom view selection in the data that translates correctly to the actual state
	 * of the multi-cell selection in the model.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} event
	 * @param {module:engine/view/observer/domeventdata~DomEventData} data Insert text event data.
	 */
	_handleInsertTextEvent( evt, data ) {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const selectedCells = this.getSelectedTableCells( modelSelection );

		if ( !selectedCells ) {
			return;
		}

		const view = editor.editing.view;
		const mapper = editor.editing.mapper;
		const viewRanges = selectedCells.map( tableCell => view.createRangeOn( mapper.toViewElement( tableCell ) ) );

		data.selection = view.createSelection( viewRanges );
	}

	/**
	 * Returns an array of table cells that should be selected based on the
	 * given anchor cell and target (focus) cell.
	 *
	 * The cells are returned in a reverse direction if the selection is backward.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} anchorCell
	 * @param {module:engine/model/element~Element} targetCell
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	_getCellsToSelect( anchorCell, targetCell ) {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const startLocation = tableUtils.getCellLocation( anchorCell );
		const endLocation = tableUtils.getCellLocation( targetCell );

		const startRow = Math.min( startLocation.row, endLocation.row );
		const endRow = Math.max( startLocation.row, endLocation.row );

		const startColumn = Math.min( startLocation.column, endLocation.column );
		const endColumn = Math.max( startLocation.column, endLocation.column );

		// 2-dimensional array of the selected cells to ease flipping the order of cells for backward selections.
		const selectionMap = new Array( endRow - startRow + 1 ).fill( null ).map( () => [] );

		const walkerOptions = {
			startRow,
			endRow,
			startColumn,
			endColumn
		};

		for ( const { row, cell } of new TableWalker( anchorCell.findAncestor( 'table' ), walkerOptions ) ) {
			selectionMap[ row - startRow ].push( cell );
		}

		const flipVertically = endLocation.row < startLocation.row;
		const flipHorizontally = endLocation.column < startLocation.column;

		if ( flipVertically ) {
			selectionMap.reverse();
		}

		if ( flipHorizontally ) {
			selectionMap.forEach( row => row.reverse() );
		}

		return {
			cells: selectionMap.flat(),
			backward: flipVertically || flipHorizontally
		};
	}
}
