/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/createelement
 */

import isIterable from '../isiterable.js';
import { isString } from 'es-toolkit/compat';

/**
 * Attributes to be applied to the HTML element.
 */
type HTMLElementAttributes = { readonly [ key: string ]: string };

/**
 * Attributes to be applied to the SVG element.
 */
type SVGElementAttributes = HTMLElementAttributes & { xmlns: string };

/**
 * Element or elements that will be added to the created element as children. Strings will be automatically turned into Text nodes.
 */
type ChildrenElements = Node | string | Iterable<Node | string>;

/**
 * Creates an SVG element with attributes and children elements.
 *
 * ```ts
 * createElement( document, 'mask', { xmlns: 'http://www.w3.org/2000/svg' } ); // <mask>
 * createElement( document, 'mask', { xmlns: 'http://www.w3.org/2000/svg', id: 'foo' } ); // <mask id="foo">
 * createElement( document, 'mask', { xmlns: 'http://www.w3.org/2000/svg' }, 'foo' ); // <mask>foo</mask>
 * createElement( document, 'mask', { xmlns: 'http://www.w3.org/2000/svg' }, [ createElement(...) ] ); // <mask><...></mask>
 * ```
 *
 * @label SVG_ELEMENT
 * @param doc Document used to create the element.
 * @param name Name of the SVG element.
 * @param attributes Object where keys represent attribute keys and values represent attribute values.
 * @param children Child or any iterable of children. Strings will be automatically turned into Text nodes.
 * @returns SVG element.
 */
export default function createElement<T extends keyof SVGElementTagNameMap>(
	doc: Document,
	name: T,
	attributes: SVGElementAttributes,
	children?: ChildrenElements
): SVGElementTagNameMap[T];

/**
 * Creates an HTML element with attributes and children elements.
 *
 * ```ts
 * createElement( document, 'p' ); // <p>
 * createElement( document, 'p', { class: 'foo' } ); // <p class="foo">
 * createElement( document, 'p', null, 'foo' ); // <p>foo</p>
 * createElement( document, 'p', null, [ createElement(...) ] ); // <p><...></p>
 * ```
 *
 * @label HTML_ELEMENT
 * @param doc Document used to create the element.
 * @param name Name of the HTML element.
 * @param attributes Object where keys represent attribute keys and values represent attribute values.
 * @param children Child or any iterable of children. Strings will be automatically turned into Text nodes.
 * @returns HTML element.
 */
export default function createElement<T extends keyof HTMLElementTagNameMap>(
	doc: Document,
	name: T,
	attributes?: HTMLElementAttributes,
	children?: ChildrenElements
): HTMLElementTagNameMap[T];

/**
 * Creates an HTML or SVG element with attributes and children elements.
 *
 * ```ts
 * createElement( document, 'p' ); // <p>
 * createElement( document, 'mask', { xmlns: 'http://www.w3.org/2000/svg' } ); // <mask>
 * ```
 *
 * @param doc Document used to create the element.
 * @param name Name of the element.
 * @param attributes Object where keys represent attribute keys and values represent attribute values.
 * @param children Child or any iterable of children. Strings will be automatically turned into Text nodes.
 * @returns HTML or SVG element.
 */
export default function createElement(
	doc: Document,
	name: string,
	attributes: SVGElementAttributes | HTMLElementAttributes = {},
	children: ChildrenElements = []
): Element {
	const namespace = attributes && attributes.xmlns;
	const element = namespace ? doc.createElementNS( namespace, name ) : doc.createElement( name );

	for ( const key in attributes ) {
		element.setAttribute( key, attributes[ key ] );
	}

	if ( isString( children ) || !isIterable( children ) ) {
		children = [ children ];
	}

	for ( let child of children ) {
		if ( isString( child ) ) {
			child = doc.createTextNode( child );
		}

		element.appendChild( child );
	}

	return element;
}
