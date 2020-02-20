/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/mouseselectionhandler
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

import { findAncestor } from '../commands/utils';
import MouseEventsObserver from './mouseeventsobserver';

/**
 * A mouse selection handler class for the table selection.
 *
 * It registers the {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver} to observe view document mouse events
 * and invoke proper {@link module:table/tableselection~TableSelection} actions.
 */
export default class MouseSelectionHandler {
	/**
	 * Creates an instance of the `MouseSelectionHandler`.
	 *
	 * @param {module:table/tableselection~TableSelection} tableSelection
	 * @param {module:engine/controller/editingcontroller~EditingController} editing
	 */
	constructor( tableSelection, editing ) {
		/**
		 * The table selection plugin instance.
		 *
		 * @private
		 * @readonly
		 * @member {module:table/tableselection~TableSelection}
		 */
		this._tableSelection = tableSelection;

		/**
		 * A flag indicating that the mouse selection is "active". A selection is "active" if it was started and not yet finished.
		 * A selection can be "active", for instance, if a user moves a mouse over a table while holding a mouse button down.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.isSelecting = false;

		/**
		 * Editing mapper.
		 *
		 * @private
		 * @readonly
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this._mapper = editing.mapper;

		const view = editing.view;

		// Currently the MouseObserver only handles `mouseup` events.
		view.addObserver( MouseEventsObserver );

		this.listenTo( view.document, 'mousedown', ( event, domEventData ) => this._handleMouseDown( domEventData ) );
		this.listenTo( view.document, 'mousemove', ( event, domEventData ) => this._handleMouseMove( domEventData ) );
		this.listenTo( view.document, 'mouseup', ( event, domEventData ) => this._handleMouseUp( domEventData ) );
	}

	/**
	 * Handles starting a selection when "mousedown" event has table cell as a DOM target.
	 *
	 * If there is no table cell in the event target, it will clear the previous selection.
	 *
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @private
	 */
	_handleMouseDown( domEventData ) {
		const tableCell = this._getModelTableCellFromDomEvent( domEventData );

		if ( !tableCell ) {
			this._tableSelection.clearSelection();
			this._tableSelection.stopSelection();

			return;
		}

		this.isSelecting = true;
		this._tableSelection.startSelectingFrom( tableCell );
	}

	/**
	 * Handles updating the table selection when the "mousemove" event has a table cell as a DOM target.
	 *
	 * Does nothing if there is no table cell in event target or the selection has not been started yet.
	 *
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @private
	 */
	_handleMouseMove( domEventData ) {
		if ( !isButtonPressed( domEventData ) ) {
			this._tableSelection.stopSelection();

			return;
		}

		const tableCell = this._getModelTableCellFromDomEvent( domEventData );

		if ( !tableCell ) {
			return;
		}

		this._tableSelection.setSelectingTo( tableCell );
	}

	/**
	 * Handles ending (not clearing) the table selection on the "mouseup" event.
	 *
	 * Does nothing if the selection has not been started yet.
	 *
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @private
	 */
	_handleMouseUp( domEventData ) {
		if ( !this.isSelecting ) {
			return;
		}

		const tableCell = this._getModelTableCellFromDomEvent( domEventData );

		// Selection can be stopped if table cell is undefined.
		this._tableSelection.stopSelection( tableCell );
	}

	/**
	 * Finds model table cell for given DOM event.
	 *
	 * @private
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @returns {module:engine/model/element~Element|undefined} Returns model table cell or undefined event target is not
	 * a mapped table cell.
	 */
	_getModelTableCellFromDomEvent( domEventData ) {
		const viewTargetElement = domEventData.target;
		const modelElement = this._mapper.toModelElement( viewTargetElement );

		if ( !modelElement ) {
			return;
		}

		if ( modelElement.is( 'tableCell' ) ) {
			return modelElement;
		}

		return findAncestor( 'tableCell', modelElement );
	}
}

mix( MouseSelectionHandler, ObservableMixin );

function isButtonPressed( domEventData ) {
	return !!domEventData.domEvent.buttons;
}

mix( MouseSelectionHandler, ObservableMixin );
