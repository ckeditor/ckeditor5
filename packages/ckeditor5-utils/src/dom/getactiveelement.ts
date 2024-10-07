/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Node, Document, Element */

/**
 * @module utils/dom/getactiveelement
 */

/**
 * TODO
 */
export default function getActiveElement( node: Node ): Element | null {
	return ( node.getRootNode() as ShadowRoot | Document ).activeElement;
}
