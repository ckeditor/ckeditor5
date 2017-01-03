/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/clickoutsidehandler
 */

/* global document */

/**
 * Handles a DOM `click` event outside of specified element and fires an action.
 *
 * Note that it is not handled by a `click` event, this is to avoid situation when click on some trigger
 * opens and closes element at the same time.
 *
 * @param {Object} options Configuration options.
 * @param {module:utils/dom/emittermixin~Emitter} options.emitter The emitter to which this behavior should be added.
 * @param {Function} options.activator Function returning a `Boolean`, to determine whether handler is active.
 * @param {HTMLElement} options.contextElement `HTMLElement` that clicking inside of which will not fire the callback.
 * @param {Function} options.callback Function fired after clicking outside of a specified element.
 */
export default function clickOutsideHandler( { emitter, activator, callback, contextElement } ) {
	emitter.listenTo( document, 'mouseup', ( evt, { target } ) => {
		if ( activator() && !contextElement.contains( target ) ) {
			callback();
		}
	} );
}
