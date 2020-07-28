/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/clickoutsidehandler
 */

/* global document */

/**
 * Handles clicking **outside** of a specified set of elements, then fires an action.
 *
 * **Note**: Actually, the action is executed upon `mousedown`, not `click`. It prevents
 * certain issues when the user keeps holding the mouse button and the UI cannot react
 * properly.
 *
 * @param {Object} options Configuration options.
 * @param {module:utils/dom/emittermixin~Emitter} options.emitter The emitter to which this behavior
 * should be added.
 * @param {Function} options.activator Function returning a `Boolean`, to determine whether the handler is active.
 * @param {Array.<HTMLElement>} options.contextElements HTML elements that determine the scope of the
 * handler. Clicking any of them or their descendants will **not** fire the callback.
 * @param {Function} options.callback An action executed by the handler.
 */
export default function clickOutsideHandler( { emitter, activator, callback, contextElements } ) {
	emitter.listenTo( document, 'mousedown', ( evt, domEvt ) => {
		if ( !activator() ) {
			return;
		}

		for ( const contextElement of contextElements ) {
			if ( contextElement.contains( domEvt.target ) ||
						( 'composedPath' in domEvt && domEvt.composedPath().includes( contextElement ) ) ) {
				return;
			}
		}

		callback();
	} );
}
