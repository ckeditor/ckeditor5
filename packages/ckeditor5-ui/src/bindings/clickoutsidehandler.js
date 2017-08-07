/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/clickoutsidehandler
 */

/* global document */

/**
 * Handles a DOM `click` event outside of specified elements and fires an action.
 *
 * Note that it is not handled by a `click` event, this is to avoid situation when click on some trigger
 * opens and closes element at the same time.
 *
 * @param {Object} options Configuration options.
 * @param {module:utils/dom/emittermixin~Emitter} options.emitter The emitter to which this behavior should be added.
 * @param {Function} options.activator Function returning a `Boolean`, to determine whether handler is active.
 * @param {Array.<HTMLElement>} options.contextElements `HTMLElement`s that clicking inside of any of them will not fire the callback.
 * @param {Function} options.callback Function fired after clicking outside of specified elements.
 */
export default function clickOutsideHandler( { emitter, activator, callback, contextElements } ) {
	emitter.listenTo( document, 'mousedown', ( evt, { target } ) => {
		if ( !activator() ) {
			return;
		}

		for ( const contextElement of contextElements ) {
			if ( contextElement.contains( target ) ) {
				return;
			}
		}

		callback();
	} );
}
