/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/observer/focusobserver
 */

/* globals setTimeout, clearTimeout */

import DomEventObserver from './domeventobserver';

/**
 * {@link module:engine/view/document~Document#event:focus Focus}
 * and {@link module:engine/view/document~Document#event:blur blur} events observer.
 * Focus observer handle also {@link module:engine/view/rooteditableelement~RootEditableElement#isFocused isFocused} property of the
 * {@link module:engine/view/rooteditableelement~RootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link module:engine/view/document~Document} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class FocusObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = [ 'focus', 'blur' ];
		this.useCapture = true;

		document.on( 'focus', () => {
			document.isFocused = true;

			// Unfortunately native `selectionchange` event is fired asynchronously.
			// We need to wait until `SelectionObserver` handle the event and then render. Otherwise rendering will
			// overwrite new DOM selection with selection from the view.
			// See https://github.com/ckeditor/ckeditor5-engine/issues/795 for more details.
			this._renderTimeoutId = setTimeout( () => document.render(), 0 );
		} );

		document.on( 'blur', ( evt, data ) => {
			const selectedEditable = document.selection.editableElement;

			if ( selectedEditable === null || selectedEditable === data.target ) {
				document.isFocused = false;

				// Re-render the document to update view elements.
				document.render();
			}
		} );

		/**
		 * Identifier of the timeout currently used by focus listener to delay rendering execution.
		 *
		 * @private
		 * @member {Number} #_renderTimeoutId
		 */
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		if ( this._renderTimeoutId ) {
			clearTimeout( this._renderTimeoutId );
		}

		super.destroy();
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/document~Document}
 * this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @event module:engine/view/document~Document#event:focus
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */

/**
 * Fired when one of the editables loses focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/document~Document}
 * this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @event module:engine/view/document~Document#event:blur
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
