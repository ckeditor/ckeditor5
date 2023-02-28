/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/clickoutsidehandler
 */

import type { DomEmitter } from '@ckeditor/ckeditor5-utils';

/* global document */

/**
 * Handles clicking **outside** of a specified set of elements, then fires an action.
 *
 * **Note**: Actually, the action is executed upon `mousedown`, not `click`. It prevents
 * certain issues when the user keeps holding the mouse button and the UI cannot react
 * properly.
 *
 * @param options Configuration options.
 * @param options.emitter The emitter to which this behavior should be added.
 * @param options.activator Function returning a `Boolean`, to determine whether the handler is active.
 * @param options.contextElements Array of HTML elements or a callback returning an array of HTML elements
 * that determine the scope of the handler. Clicking any of them or their descendants will **not** fire the callback.
 * @param options.callback An action executed by the handler.
 */
export default function clickOutsideHandler(
	{ emitter, activator, callback, contextElements }: {
		emitter: DomEmitter;
		activator: () => boolean;
		contextElements: Array<HTMLElement> | ( () => Array<HTMLElement> );
		callback: () => void;
	}
): void {
	emitter.listenTo( document, 'mousedown', ( evt, domEvt ) => {
		if ( !activator() ) {
			return;
		}

		// Check if `composedPath` is `undefined` in case the browser does not support native shadow DOM.
		// Can be removed when all supported browsers support native shadow DOM.
		const path = typeof domEvt.composedPath == 'function' ? domEvt.composedPath() : [];

		const contextElementsList = typeof contextElements == 'function' ? contextElements() : contextElements;

		for ( const contextElement of contextElementsList ) {
			if ( contextElement.contains( domEvt.target as Node ) || path.includes( contextElement ) ) {
				return;
			}
		}

		callback();
	} );
}
