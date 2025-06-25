/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/containerelement
 */

import { ViewElement, type ViewElementAttributes } from './element.js';
import { type ViewDocument } from './document.js';
import { type ViewNode } from './node.js';

/**
 * Containers are elements which define document structure. They define boundaries for
 * {@link module:engine/view/attributeelement~ViewAttributeElement attributes}.
 * They are mostly used for block elements like `<p>` or `<div>`.
 *
 * Editing engine does not define a fixed HTML DTD. This is why a feature developer needs to choose between various
 * types (container element, {@link module:engine/view/attributeelement~ViewAttributeElement attribute element},
 * {@link module:engine/view/emptyelement~ViewEmptyElement empty element}, etc) when developing a feature.
 *
 * The container element should be your default choice when writing a converter, unless:
 *
 * * this element represents a model text attribute (then use {@link module:engine/view/attributeelement~ViewAttributeElement}),
 * * this is an empty element like `<img>` (then use {@link module:engine/view/emptyelement~ViewEmptyElement}),
 * * this is a root element,
 * * this is a nested editable element (then use  {@link module:engine/view/editableelement~ViewEditableElement}).
 *
 * To create a new container element instance use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createContainerElement `ViewDowncastWriter#createContainerElement()`}
 * method.
 */
export class ViewContainerElement extends ViewElement {
	/**
	 * Creates a container element.
	 *
	 * @see module:engine/view/downcastwriter~ViewDowncastWriter#createContainerElement
	 * @see module:engine/view/element~ViewElement
	 * @internal
	 * @param document The document instance to which this element belongs.
	 * @param name Node name.
	 * @param attrs Collection of attributes.
	 * @param children A list of nodes to be inserted into created element.
	 */
	constructor(
		document: ViewDocument,
		name: string,
		attrs?: ViewElementAttributes,
		children?: ViewNode | Iterable<ViewNode>
	) {
		super( document, name, attrs, children );

		this.getFillerOffset = getViewFillerOffset;
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewContainerElement.prototype.is = function( type: string, name?: string ): boolean {
	if ( !name ) {
		return type === 'containerElement' || type === 'view:containerElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'view:element' ||
			type === 'node' || type === 'view:node';
	} else {
		return name === this.name && (
			type === 'containerElement' || type === 'view:containerElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'view:element'
		);
	}
};

/**
 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
 *
 * @returns Block filler offset or `null` if block filler is not needed.
 */
export function getViewFillerOffset( this: ViewContainerElement ): number | null {
	const children = [ ...this.getChildren() ];
	const lastChild = children[ this.childCount - 1 ];

	// Block filler is required after a `<br>` if it's the last element in its container. See #1422.
	if ( lastChild && lastChild.is( 'element', 'br' ) ) {
		return this.childCount;
	}

	for ( const child of children ) {
		// If there's any non-UI element – don't render the bogus.
		if ( !child.is( 'uiElement' ) ) {
			return null;
		}
	}

	// If there are only UI elements – render the bogus at the end of the element.
	return this.childCount;
}
