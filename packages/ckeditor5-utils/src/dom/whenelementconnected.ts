/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/whenelementconnected
 */

import { ResizeObserver } from './resizeobserver.js';

/**
 * Calls the callback once the given element is connected to a document, and at most once.
 *
 * For code that has to act on the tree an element lives in – injecting styles, resolving a mount target – but is
 * handed the element before it is mounted. The editable of a `DecoupledEditor`, or of any editor created from a
 * data string, is put in the DOM by the integrator at an arbitrary point in time. An element that is already
 * connected is reported synchronously, so the caller needs no second path for that case.
 *
 * "Connected" means connected to a document: an element in a shadow tree qualifies once that tree's host does,
 * and one in a detached tree never does. It is not a visibility check – the element may be connected while
 * having no box of its own, or while an ancestor is not rendered.
 *
 * The waiting is backed by a {@link module:utils/dom/resizeobserver~ResizeObserver}, so the notification is
 * asynchronous and arrives once the element is rendered. For an element mounted into a `display: none` subtree
 * the callback may therefore run on the mount or only once that subtree is shown, depending on the engine. It
 * runs exactly once either way.
 *
 * @param element The element to wait for.
 * @param callback Called once `element` is connected, or immediately if it already is.
 * @returns Cancels the waiting. Safe to call any number of times, and does nothing once the callback has run.
 */
export function whenElementConnected( element: HTMLElement, callback: () => void ): () => void {
	if ( element.isConnected ) {
		callback();

		return () => {};
	}

	let observer: ResizeObserver | null = new ResizeObserver( element, () => {
		if ( !element.isConnected || !observer ) {
			return;
		}

		observer.destroy();
		observer = null;

		callback();
	} );

	return () => {
		observer?.destroy();
		observer = null;
	};
}
