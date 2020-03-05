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
import MouseEventsObserver from './tableselection/mouseeventsobserver';
import { getTableCellsInSelection, clearTableCellsContents } from './tableselection/utils';
import { findAncestor } from './commands/utils';
import cropTable from './tableselection/croptable';

import '../theme/tableselection.css';

/**
 * TODO
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
	init() {
		const editor = this.editor;
		const model = editor.model;

		this.listenTo( model, 'deleteContent', ( evt, args ) => this._handleDeleteContent( evt, args ), { priority: 'high' } );

		// Currently the MouseObserver only handles `mouseup` events.
		// TODO move to the engine?
		editor.editing.view.addObserver( MouseEventsObserver );

		this._defineSelectionConverter();
		this._enableShiftClickSelection();
		this._enableMouseDragSelection();
	}

	/**
	 * Returns currently selected table cells or `null` if not a table cells selection.
	 *
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	getSelectedTableCells() {
		const selection = this.editor.model.document.selection;

		const selectedCells = getTableCellsInSelection( selection );

		if ( selectedCells.length == 0 ) {
			return null;
		}

		// This should never happen, but let's know if it ever happens.
		// @if CK_DEBUG //	if ( selectedCells.length != selection.rangeCount ) {
		// @if CK_DEBUG //		console.warn( 'Mixed selection warning. The selection contains table cells and some other ranges.' );
		// @if CK_DEBUG //	}

		return selectedCells;
	}

	/**
	 * Returns a selected table fragment as a document fragment.
	 *
	 * @returns {module:engine/model/documentfragment~DocumentFragment}
	 */
	getSelectionAsFragment() {
		return this.editor.model.change( writer => {
			const documentFragment = writer.createDocumentFragment();
			const table = cropTable( this.getSelectedTableCells(), this.editor.plugins.get( 'TableUtils' ), writer );

			writer.insert( table, documentFragment, 0 );

			return documentFragment;
		} );
	}

	/**
	 * Defines a selection converter which marks selected cells with a specific class.
	 *
	 * The real DOM selection is put in the last cell. Since the order of ranges is dependent on whether the
	 * selection is backward or not, the last cell with usually be close to the "focus" end of the selection
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
	 * Enables making cells selection by Shift+click. Creates a selection from the cell which previously hold
	 * the selection to the cell which was clicked (can be the same cell, in which case it selects a single cell).
	 *
	 * @private
	 */
	_enableShiftClickSelection() {
		const editor = this.editor;
		let blockSelectionChange = false;

		this.listenTo( editor.editing.view.document, 'mousedown', ( evt, domEventData ) => {
			if ( !domEventData.domEvent.shiftKey ) {
				return;
			}

			const anchorCell = findAncestor( 'tableCell', editor.model.document.selection.anchor.parent );

			if ( !anchorCell ) {
				return;
			}

			const targetCell = this._getModelTableCellFromDomEvent( domEventData );

			if ( !targetCell ) {
				return;
			}

			blockSelectionChange = true;
			this._setCellsSelection( anchorCell, targetCell );

			domEventData.preventDefault();
		} );

		this.listenTo( editor.editing.view.document, 'mouseup', () => {
			blockSelectionChange = false;
		} );

		// We need to ignore a `selectionChange` event that is fired after we render our new table cells selection.
		// When downcasting table cells selection to the view, we put the view selection in the last selected cell
		// in a place that may not be natively a "correct" location. This is – we put it directly in the `<td>` element.
		// All browsers fire the native `selectionchange` event.
		// However, all browsers except Safari return the selection in the exact place where we put it
		// (even though it's visually normalized). Safari returns `<td><p>^foo` that makes our selection observer
		// fire our `selectionChange` event (because the view selection that we set in the first step differs from the DOM selection).
		// Since `selectionChange` is fired, we automatically update the model selection that moves it that paragraph.
		// This breaks our dear cells selection.
		//
		// Theoretically this issue concerns only Safari that is the only browser that do normalize the selection.
		// However, to avoid code branching and to have a good coverage for this event blocker, I enabled it for all browsers.
		//
		// Note: I'm keeping the `blockSelectionChange` state separately for shift+click and mouse drag (exact same logic)
		// so I don't have to try to analyze whether they don't overlap in some weird cases. Probably they don't.
		// But I have other things to do, like writing this comment.
		this.listenTo( editor.editing.view.document, 'selectionChange', evt => {
			if ( blockSelectionChange ) {
				// @if CK_DEBUG // console.log( 'Blocked selectionChange to avoid breaking table cells selection.' );

				evt.stop();
			}
		}, { priority: 'highest' } );
	}

	/**
	 * Enables making cells selection by dragging.
	 *
	 * The selection is made only on mousemove. We start tracking the mouse on mousedown.
	 * However, the cells selection is enabled only after the mouse cursor left the anchor cell.
	 * Thanks to that normal text selection within one cell works just fine. However, you can still select
	 * just one cell by leaving the anchor cell and moving back to it.
	 *
	 * @private
	 */
	_enableMouseDragSelection() {
		const editor = this.editor;
		let anchorCell, targetCell;
		let beganCellSelection = false;
		let blockSelectionChange = false;

		this.listenTo( editor.editing.view.document, 'mousedown', ( evt, domEventData ) => {
			// Make sure to not conflict with the shift+click listener and any other possible handler.
			if ( domEventData.domEvent.shiftKey || domEventData.domEvent.ctrlKey || domEventData.domEvent.altKey ) {
				return;
			}

			anchorCell = this._getModelTableCellFromDomEvent( domEventData );
		} );

		this.listenTo( editor.editing.view.document, 'mousemove', ( evt, domEventData ) => {
			if ( !domEventData.domEvent.buttons ) {
				return;
			}

			if ( !anchorCell ) {
				return;
			}

			const newTargetCell = this._getModelTableCellFromDomEvent( domEventData );

			if ( newTargetCell && haveSameTableParent( anchorCell, newTargetCell ) ) {
				targetCell = newTargetCell;

				// Switch to the cell selection mode after the mouse cursor left the anchor cell.
				// Switch off only on mouseup (makes selecting a single cell possible).
				if ( !beganCellSelection && targetCell != anchorCell ) {
					beganCellSelection = true;
				}
			}

			// Yep, not making a cell selection yet. See method docs.
			if ( !beganCellSelection ) {
				return;
			}

			blockSelectionChange = true;
			this._setCellsSelection( anchorCell, targetCell );

			domEventData.preventDefault();
		} );

		this.listenTo( editor.editing.view.document, 'mouseup', () => {
			beganCellSelection = false;
			blockSelectionChange = false;
			anchorCell = null;
			targetCell = null;
		} );

		// See the explanation in `_enableShiftClickSelection()`.
		this.listenTo( editor.editing.view.document, 'selectionChange', evt => {
			if ( blockSelectionChange ) {
				// @if CK_DEBUG // console.log( 'Blocked selectionChange to avoid breaking table cells selection.' );

				evt.stop();
			}
		}, { priority: 'highest' } );

		function haveSameTableParent( cellA, cellB ) {
			return cellA.parent.parent == cellB.parent.parent;
		}
	}

	/**
	 * It overrides the default `model.deleteContent()` behavior over a selected table fragment.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} event
	 * @param {Array.<*>} args Delete content method arguments.
	 */
	_handleDeleteContent( event, args ) {
		const [ selection, options ] = args;
		const model = this.editor.model;
		const isBackward = !options || options.direction == 'backward';
		const selectedTableCells = getTableCellsInSelection( selection );

		if ( !selectedTableCells.length ) {
			return;
		}

		event.stop();

		model.change( writer => {
			const tableCellToSelect = selectedTableCells[ isBackward ? selectedTableCells.length - 1 : 0 ];

			clearTableCellsContents( model, selectedTableCells );

			// The insertContent() helper passes the actual DocumentSelection,
			// while the deleteContent() helper always operates on the abstract clones.
			if ( selection.is( 'documentSelection' ) ) {
				writer.setSelection( tableCellToSelect, 'in' );
			} else {
				selection.setTo( tableCellToSelect, 'in' );
			}
		} );
	}

	/**
	 * Sets the model selection based on given anchor and target cells (can be the same cell).
	 * Takes care of setting backward flag.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} anchorCell
	 * @param {module:engine/model/element~Element} targetCell
	 */
	_setCellsSelection( anchorCell, targetCell ) {
		const cellsToSelect = this._getCellsToSelect( anchorCell, targetCell );

		this.editor.model.change( writer => {
			writer.setSelection(
				cellsToSelect.cells.map( cell => writer.createRangeOn( cell ) ),
				{ backward: cellsToSelect.backward }
			);
		} );
	}

	/**
	 * Returns the model table cell element based on the target element of the passed DOM event.
	 *
	 * @private
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @returns {module:engine/model/element~Element|undefined} Returns the table cell or `undefined`.
	 */
	_getModelTableCellFromDomEvent( domEventData ) {
		// Note: Work with positions (not element mapping) because the target element can be an attribute or other non-mapped element.
		const viewTargetElement = domEventData.target;
		const viewPosition = this.editor.editing.view.createPositionAt( viewTargetElement, 0 );
		const modelPosition = this.editor.editing.mapper.toModelPosition( viewPosition );
		const modelElement = modelPosition.parent;

		if ( !modelElement ) {
			return;
		}

		if ( modelElement.is( 'tableCell' ) ) {
			return modelElement;
		}

		return findAncestor( 'tableCell', modelElement );
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

		const cells = [];

		for ( const cellInfo of new TableWalker( findAncestor( 'table', anchorCell ), { startRow, endRow } ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				cells.push( cellInfo.cell );
			}
		}

		// A selection started in the bottom right corner and finished in the upper left corner
		// should have it ranges returned in the reverse order.
		// However, this is only half of the story because the selection could be made to the left (then the left cell is a focus)
		// or to the right (then the right cell is a focus), while being a forward selection in both cases
		// (because it was made from top to bottom). This isn't handled.
		// This method would need to be smarter, but the ROI is microscopic, so I skip this.
		if ( checkIsBackward( startLocation, endLocation ) ) {
			return { cells: cells.reverse(), backward: true };
		}

		return { cells, backward: false };
	}
}

// Naively check whether the selection should be backward or not. See the longer explanation where this function is used.
function checkIsBackward( startLocation, endLocation ) {
	if ( startLocation.row > endLocation.row ) {
		return true;
	}

	if ( startLocation.row == endLocation.row && startLocation.column > endLocation.column ) {
		return true;
	}

	return false;
}

