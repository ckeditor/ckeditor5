/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isshadowroot
 */

/**
 * Checks whether the given object is a native DOM `ShadowRoot`.
 *
 * A type guard, safe to call on any value, and correct for a root belonging to another document or iframe.
 *
 * @param obj The object to check.
 */
export function isShadowRoot( obj: unknown ): obj is ShadowRoot {
	if ( !obj ) {
		return false;
	}

	// Resolved through the object's own realm rather than the global one, so a root from an iframe is
	// recognized too. A document with no browsing context (`DOMParser`, `createHTMLDocument()`) has no
	// `defaultView` and belongs to the current realm, so the current realm's constructor is the fallback.
	const defaultView = ( obj as Node ).ownerDocument?.defaultView;

	// An `instanceof` check on purpose: testing for a truthy `host` property would also match `<a>`
	// elements, which expose `host` as a part of their URL API.
	return obj instanceof ( defaultView ? defaultView.ShadowRoot : ShadowRoot );
}

/**
 * Checks whether the given object is a shadow root the platform itself accepts.
 *
 * A page may run a shadow DOM polyfill that emulates the boundary in the light DOM instead of asking the
 * engine for one – a *synthetic* shadow root. Such a root passes {@link ~isShadowRoot}, because the polyfill
 * replaces the global `ShadowRoot` with its own constructor and patches `Symbol.hasInstance` on it. It
 * emulates the tree faithfully enough for traversal (`host`, `parentNode`, `contains`, `activeElement` all
 * behave), which is why {@link ~isShadowRoot} stays truthful about it, but being no platform object it
 * cannot be:
 *
 * * passed to a DOM API expecting a real root – `Selection#getComposedRanges()` and
 *   `Document#caretPositionFromPoint()` reject it while converting their arguments;
 * * asked for its selection or stylesheets – those are the members a polyfill cannot emulate, so it
 *   usually makes them throw;
 * * used as a mount target – its `appendChild()` delegates to the host element, so the node ends up in the
 *   surrounding tree rather than at the top of the one it was mounted in.
 *
 * Use it wherever a root crosses into one of those, and {@link ~isShadowRoot} everywhere else. Answering
 * `false` here falls back to the light-DOM path, which is the correct answer for a synthetic root: the
 * boundary it emulates is not one the engine actually has, so the document-level APIs already see the real
 * nodes behind it.
 *
 * @internal
 * @param obj The object to check.
 */
export function isNativeShadowRoot( obj: unknown ): obj is ShadowRoot {
	// The flag a synthetic implementation sets on its own roots, and the only reliable way to tell them
	// apart – every other member is emulated to match a real root.
	return isShadowRoot( obj ) && ( obj as { synthetic?: boolean } ).synthetic !== true;
}
