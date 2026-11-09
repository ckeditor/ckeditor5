/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getpositionedancestor
 */

import { getLayoutParentElement } from './getlayoutparentelement.js';
import { getParentElement } from './getparentelement.js';

/**
 * Returns the element the given one is laid out against while absolutely positioned – the element whose padding
 * box its `top` and `left` are relative to. Returns `null` when there is nothing to compensate for: the element
 * is laid out against the initial containing block, is `position: fixed`, or is not rendered at all.
 *
 * Use it when turning a position measured against the viewport into the `top` and `left` to set on an absolutely
 * positioned element, by subtracting the returned element's padding-box offset – the way
 * {@link module:utils/dom/rect~Rect#toAbsoluteRect} and {@link module:utils/dom/position~getOptimalPosition} do.
 *
 * The layout-aware counterpart of `Element#offsetParent`, and what to reach for instead of it: this one follows
 * the **flattened tree**, the one the browser lays out, so it stays right for slotted content – an editor slotted
 * into a container component – where `offsetParent` names an element that does not lay that content out. Falls
 * back to `offsetParent` for slotted content inside a closed root, whose slot the DOM standard does not expose.
 *
 * @param element The native DOM element to be checked.
 */
export function getPositionedAncestor( element?: HTMLElement ): HTMLElement | null {
	if ( !element || !element.isConnected ) {
		return null;
	}

	// `offsetParent` is exactly right about *which* element establishes a containing block: a non-`static`
	// `position`, but also `transform`, `filter`, `perspective`, containment and the rest, and `<td>`/`<table>`.
	// What it is not right about is *where it looks*: it walks the node tree, and assigning a node to a `<slot>`
	// does not move it, so for slotted content it names an element that does not lay that content out and skips
	// the shadow tree that does. So it is asked, and its answer taken only where the flattened tree agrees.
	const offsetParent = element.offsetParent;

	// No `offsetParent` at all: the element is `position: fixed`, so it is laid out against the viewport, or it
	// is not rendered. Neither has an ancestor to be relative to. The browser answers the same for content
	// slotted into a fixed element (a modal `<dialog>`, a popover), which that element does lay out – so only
	// the element itself is judged here, and the slotted case is left to the slot walk below.
	if ( !offsetParent && isFixedOrNotRendered( element ) ) {
		return null;
	}

	// Whichever of the two comes first on the way out decides whether the browser's answer can be used: a slot
	// closer than `offsetParent` means the flattened tree parts ways with the node tree before that answer is
	// reached, so it describes the wrong branch.
	const slot = findSlotCloserThan( element, offsetParent );

	if ( !slot ) {
		// No `offsetParent` and no slot to follow instead: `<body>` itself, or content slotted into a fixed element
		// through a closed root, whose slot is not exposed. Nothing is left to ask.
		if ( !offsetParent ) {
			return null;
		}

		// `offsetParent` names `<body>` for two different reasons: either the body really is what lays the
		// element out (it is positioned, transformed, and so on), or nothing lays it out and `<body>` is just
		// the fallback the spec returns – a static body does not lay out its absolutely positioned children,
		// the initial containing block does. Only the second case is `null`, so ask the body which one it is.
		if ( offsetParent === offsetParent.ownerDocument.body && !isContainingBlock( offsetParent ) ) {
			return null;
		}

		return offsetParent as HTMLElement;
	}

	// Past the slot the browser's answer no longer applies, so the elements rendering the content are judged
	// here. An element without a box lays nothing out, so it is stepped over: the slot by default, as well as
	// a wrapper or a host styled `display: contents`. A slot styled to have a box is an ordinary element.
	let candidate: Element = slot;

	// A `display: contents` element always has a layout parent: it is never the root element, on which that
	// value computes to `block`. For a slot, it is the slot it is itself assigned to, or the element above it.
	while ( isDisplayContents( candidate ) ) {
		candidate = getLayoutParentElement( candidate )!;
	}

	if ( isContainingBlock( candidate ) ) {
		return candidate as HTMLElement;
	}

	// An ordinary element again, a slot with a box included, so start over from it and let the browser answer
	// for what lies above. Each step out is strictly further from `element`, so this bottoms out at the document.
	return getPositionedAncestor( candidate as HTMLElement );
}

/**
 * Walks outwards from the given node looking for the slot it is assigned to, and stops once `offsetParent` is
 * reached – so the result tells which of the two is nearer. A slot means the node tree and the flattened tree
 * part ways first; `null` means they agree all the way to `offsetParent`. Without an `offsetParent`, the walk
 * goes all the way to the root.
 */
function findSlotCloserThan( node: Element, offsetParent: Element | null ): HTMLSlotElement | null {
	let current: Element | null = node;

	// `offsetParent` is a node-tree ancestor of the element, so the walk always reaches it – or, without one, the root.
	while ( current && current !== offsetParent ) {
		// An assigned node renders inside its slot, and that hop is where the walk leaves the node tree.
		if ( current.assignedSlot ) {
			return current.assignedSlot;
		}

		current = getParentElement( current );
	}

	return null;
}

/**
 * Whether the given element is laid out against the viewport (`position: fixed`) or is not rendered at all.
 *
 * An element is rendered when it has a box, which is what `getClientRects()` tells: a rect for every box fragment,
 * zero-sized ones included (an empty inline element), and none for an element without a box – `display: none` on
 * it or an ancestor, or `display: contents`.
 */
function isFixedOrNotRendered( element: HTMLElement ): boolean {
	return !element.getClientRects().length ||
		element.ownerDocument.defaultView!.getComputedStyle( element ).position === 'fixed';
}

/**
 * Whether the given element has no box of its own, so its children are laid out as if they were its parent's.
 */
function isDisplayContents( element: Element ): boolean {
	return element.ownerDocument.defaultView!.getComputedStyle( element ).display === 'contents';
}

/**
 * `contain` values that include layout or paint containment, either of which makes an element the containing
 * block of its absolutely positioned descendants. `size` alone does not.
 */
const CONTAINING_BLOCK_CONTAIN = /\b(?:layout|paint|strict|content)\b/;

/**
 * `will-change` values naming a property that establishes a containing block on its own. `filter` also matches
 * `backdrop-filter`, which is intended.
 */
const CONTAINING_BLOCK_WILL_CHANGE = /\b(?:transform|perspective|filter|contain)\b/;

/**
 * Whether the given element is the containing block of its absolutely positioned descendants.
 *
 * Needed where `offsetParent` cannot answer: the slot a node is assigned to and the element above it, which it
 * cannot be asked about at all – it answers what lies *above* an element, never whether the element itself
 * qualifies – and `<body>`, which it also names when nothing above the element establishes a containing block.
 * The property list is what Chrome establishes a containing block for, verified against `offsetParent`, which
 * agrees with the rendered result in every one of these cases.
 *
 * Only asked about elements with a box, which `position` and the rest need to have any effect: the slot walk
 * steps over `display: contents` candidates before asking, `offsetParent` never names a boxless `<body>`, and
 * a `display: none` element never gets here, as the content it would render is unrendered too and the caller
 * answers that first.
 */
function isContainingBlock( element: Element ): boolean {
	const styles = element.ownerDocument.defaultView!.getComputedStyle( element );

	if ( styles.position !== 'static' ) {
		return true;
	}

	return isNonInitial( styles.transform, 'none' ) ||
		isNonInitial( styles.translate, 'none' ) ||
		isNonInitial( styles.rotate, 'none' ) ||
		isNonInitial( styles.scale, 'none' ) ||
		isNonInitial( styles.perspective, 'none' ) ||
		isNonInitial( styles.filter, 'none' ) ||
		isNonInitial( styles.backdropFilter, 'none' ) ||
		isNonInitial( styles.contentVisibility, 'visible' ) ||
		CONTAINING_BLOCK_CONTAIN.test( styles.contain ) ||
		CONTAINING_BLOCK_WILL_CHANGE.test( styles.willChange );
}

/**
 * Whether a computed value is something other than the property's initial value, which is what makes the
 * property establish a containing block.
 *
 * A property the browser does not know has no computed value at all, and the comparison alone would read that
 * as a value unlike the initial one. Something unsupported establishes nothing, so it answers `false` instead.
 */
function isNonInitial( value: string | undefined, initialValue: string ): boolean {
	return !!value && value !== initialValue;
}
