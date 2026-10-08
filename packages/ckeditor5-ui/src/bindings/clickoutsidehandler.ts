/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/bindings/clickoutsidehandler
 */

import { isShadowRoot, type DomEmitter } from '@ckeditor/ckeditor5-utils';

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
export function clickOutsideHandler(
	{ emitter, activator, callback, contextElements }: {
		emitter: DomEmitter;
		activator: () => boolean;
		contextElements: Array<Element> | ( () => Array<Element> );
		callback: () => void;
	}
): void {
	// Roots already covered by a listener of their own, so each one is listened to only once.
	const listenedRoots = new WeakSet<ShadowRoot>();

	// Whether any shadow root listener detected a click inside a context element.
	let insideContext = false;

	// Resolves context elements to an array of elements.
	function getContextElements(): Array<Element> {
		const elements = typeof contextElements == 'function' ? contextElements() : contextElements;

		return elements.filter( element => element );
	}

	// Setups the listeners on shadow root of every context element.
	// Only listener on a shadow root provides a real target for the event (not the shadow root host).
	function listenToContextElementRoots( contextElements: Array<Element> ): void {
		for ( const contextElement of contextElements ) {
			const root = contextElement.getRootNode();

			if ( root === document || !isShadowRoot( root ) || listenedRoots.has( root ) ) {
				continue;
			}

			listenedRoots.add( root );

			emitter.listenTo( root, 'mousedown', ( evt, domEvt ) => {
				if ( activator() && isInsideContext( domEvt, getContextElements() ) ) {
					insideContext = true;
				}
			} );
		}
	}

	// Setup listeners on the context elements' shadow roots.
	emitter.listenTo( document, 'mousedown', () => {
		if ( activator() ) {
			listenToContextElementRoots( getContextElements() );
		}

		// Clear the flag from shadow root listeners. It will be set again if any of them detects a click inside a context element.
		insideContext = false;
	}, { useCapture: true } );

	// The main listener.
	emitter.listenTo( document, 'mousedown', ( evt, domEvt ) => {
		if ( activator() && !isInsideContext( domEvt, getContextElements() ) && !insideContext ) {
			callback();
		}

		// Clear the flag from shadow root listeners to leave it clean for future events.
		insideContext = false;
	} );
}

/**
 * Returns true when the given DOM event target is indide any of context elements.
 */
function isInsideContext( domEvt: Event, contextElements: Array<Element> ): boolean {
	for ( const contextElement of contextElements ) {
		if ( contextElement.contains( domEvt.target as Node ) ) {
			return true;
		}
	}

	return false;
}
