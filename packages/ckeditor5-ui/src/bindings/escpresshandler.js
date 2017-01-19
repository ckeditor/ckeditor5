/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/escpresshandler
 */

/* global document */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Detects <kbd>Esc</kbd> `keydown` DOM event and fires an action.
 *
 * @param {Object} options Configuration options.
 * @param {module:utils/dom/emittermixin~Emitter} options.emitter The emitter to which this behavior should be added.
 * @param {Function} options.activator Function returning a `Boolean`, to determine whether handler is active.
 * @param {Function} options.callback Function fired after <kbd>Esc</kbd> is pressed.
 */
export default function escPressHandler( { emitter, activator, callback } ) {
	emitter.listenTo( document, 'keydown', ( evt, { keyCode } ) => {
		if ( keyCode == keyCodes.esc && activator() ) {
			callback();
		}
	} );
}
