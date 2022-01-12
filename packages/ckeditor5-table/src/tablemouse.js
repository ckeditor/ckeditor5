/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablemouse
 */

import { Plugin } from 'ckeditor5/src/core';

import TableSelection from './tableselection';
import MouseEventsObserver from './tablemouse/mouseeventsobserver';

import { getTableCellsContainingSelection } from './utils/selection';

/**
 * This plugin enables a table cells' selection with the mouse.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableMouse extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableMouse';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableSelection ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Currently the MouseObserver only handles `mousedown` and `mouseup` events.
		// TODO move to the engine?
		editor.editing.view.addObserver( MouseEventsObserver );

		this._enableShiftClickSelection();
		this._enableMouseDragSelection();
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

		const tableSelection = editor.plugins.get( TableSelection );

		this.listenTo( editor.editing.view.document, 'mousedown', ( evt, domEventData ) => {
			if ( !this.isEnabled || !tableSelection.isEnabled ) {
				return;
			}

			if ( !domEventData.domEvent.shiftKey ) {
				return;
			}

			const anchorCell = tableSelection.getAnchorCell() || getTableCellsContainingSelection( editor.model.document.selection )[ 0 ];

			if ( !anchorCell ) {
				return;
			}

			const targetCell = this._getModelTableCellFromDomEvent( domEventData );

			if ( targetCell && haveSameTableParent( anchorCell, targetCell ) ) {
				blockSelectionChange = true;
				tableSelection.setCellSelection( anchorCell, targetCell );

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

		const tableSelection = editor.plugins.get( TableSelection );

		this.listenTo( editor.editing.view.document, 'mousedown', ( evt, domEventData ) => {
			if ( !this.isEnabled || !tableSelection.isEnabled ) {
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
			tableSelection.setCellSelection( anchorCell, targetCell );

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

		return modelElement.findAncestor( 'tableCell', { includeSelf: true } );
	}
}

function haveSameTableParent( cellA, cellB ) {
	return cellA.parent.parent == cellB.parent.parent;
}
