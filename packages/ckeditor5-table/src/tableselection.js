/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import first from '@ckeditor/ckeditor5-utils/src/first';

import TableWalker from './tablewalker';
import TableUtils from './tableutils';
import MouseEventsObserver from './tableselection/mouseeventsobserver';
import {
	getSelectedTableCells,
	getTableCellsContainingSelection
} from './utils';
import { findAncestor } from './commands/utils';
import cropTable from './tableselection/croptable';

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
		this._enablePluginDisabling(); // sic!
	}

	/**
	 * Returns the currently selected table cells or `null` if it is not a table cells selection.
	 *
	 * @returns {Array.<module:engine/model/element~Element>|null}
	 */
	getSelectedTableCells() {
		const selection = this.editor.model.document.selection;

		const selectedCells = getSelectedTableCells( selection );

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
		const selectedCells = this.getSelectedTableCells();

		if ( !selectedCells ) {
			return null;
		}

		return this.editor.model.change( writer => {
			const documentFragment = writer.createDocumentFragment();
			const table = cropTable( selectedCells, this.editor.plugins.get( 'TableUtils' ), writer );

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

		if ( element && element.is( 'tableCell' ) ) {
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

		if ( element && element.is( 'tableCell' ) ) {
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
	 * Enables making cells selection by <kbd>Shift</kbd>+click. Creates a selection from the cell which previously held
	 * the selection to the cell which was clicked. It can be the same cell, in which case it selects a single cell.
	 *
	 * @private
	 */
	_enableShiftClickSelection() {
		const editor = this.editor;
		let blockSelectionChange = false;

		this.listenTo( editor.editing.view.document, 'mousedown', ( evt, domEventData ) => {
			if ( !this.isEnabled ) {
				return;
			}

			if ( !domEventData.domEvent.shiftKey ) {
				return;
			}

			const anchorCell = getTableCellsContainingSelection( editor.model.document.selection )[ 0 ];

			if ( !anchorCell ) {
				return;
			}

			const targetCell = this._getModelTableCellFromDomEvent( domEventData );

			if ( targetCell && haveSameTableParent( anchorCell, targetCell ) ) {
				blockSelectionChange = true;
				this.setCellSelection( anchorCell, targetCell );

				domEventData.preventDefault();
			}
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
	 * The selection is made only on mousemove. Mouse tracking is started on mousedown.
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
			if ( !this.isEnabled ) {
				return;
			}

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
			this.setCellSelection( anchorCell, targetCell );

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
		const [ selection, options ] = args;
		const model = this.editor.model;
		const isBackward = !options || options.direction == 'backward';
		const selectedTableCells = getSelectedTableCells( selection );

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

		// 2-dimensional array of the selected cells to ease flipping the order of cells for backward selections.
		const selectionMap = new Array( endRow - startRow + 1 ).fill( null ).map( () => [] );

		for ( const cellInfo of new TableWalker( findAncestor( 'table', anchorCell ), { startRow, endRow } ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				selectionMap[ cellInfo.row - startRow ].push( cellInfo.cell );
			}
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

function haveSameTableParent( cellA, cellB ) {
	return cellA.parent.parent == cellB.parent.parent;
}
