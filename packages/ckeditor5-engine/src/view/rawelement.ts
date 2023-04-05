/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @module engine/view/rawelement
 */

import Element, { type ElementAttributes } from './element';
import Node from './node';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type Document from './document';
import type DomConverter from './domconverter';
import type Item from './item';

type DomElement = globalThis.HTMLElement;

/**
 * The raw element class.
 *
 * The raw elements work as data containers ("wrappers", "sandboxes") but their children are not managed or
 * even recognized by the editor. This encapsulation allows integrations to maintain custom DOM structures
 * in the editor content without, for instance, worrying about compatibility with other editor features.
 * Raw elements are a perfect tool for integration with external frameworks and data sources.
 *
 * Unlike {@link module:engine/view/uielement~UIElement UI elements}, raw elements act like real editor
 * content (similar to {@link module:engine/view/containerelement~ContainerElement} or
 * {@link module:engine/view/emptyelement~EmptyElement}), they are considered by the editor selection and
 * {@link module:widget/utils~toWidget they can work as widgets}.
 *
 * To create a new raw element, use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createRawElement `downcastWriter#createRawElement()`} method.
 */
export default class RawElement extends Element {
	/**
	 * Creates a new instance of a raw element.
	 *
	 * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} when the `children`
	 * parameter is passed to inform that the usage of `RawElement` is incorrect (adding child nodes to `RawElement` is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createRawElement
	 * @internal
	 * @param document The document instance to which this element belongs.
	 * @param name Node name.
	 * @param attrs Collection of attributes.
	 * @param children A list of nodes to be inserted into created element.
	 */
	constructor(
		document: Document,
		name: string,
		attrs?: ElementAttributes,
		children?: Node | Iterable<Node>
	) {
		super( document, name, attrs, children );

		// Returns `null` because filler is not needed for raw elements.
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Overrides the {@link module:engine/view/element~Element#_insertChild} method.
	 * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} to prevent
	 * adding any child nodes to a raw element.
	 *
	 * @internal
	 */
	public override _insertChild( index: number, items: Item | Iterable<Item> ): number {
		if ( items && ( items instanceof Node || Array.from( items as Iterable<Item> ).length > 0 ) ) {
			/**
			 * Cannot add children to a {@link module:engine/view/rawelement~RawElement} instance.
			 *
			 * @error view-rawelement-cannot-add
			 */
			throw new CKEditorError(
				'view-rawelement-cannot-add',
				[ this, items ]
			);
		}

		return 0;
	}

	/**
	 * This allows rendering the children of a {@link module:engine/view/rawelement~RawElement} on the DOM level.
	 * This method is called by the {@link module:engine/view/domconverter~DomConverter} with the raw DOM element
	 * passed as an argument, leaving the number and shape of the children up to the integrator.
	 *
	 * This method **must be defined** for the raw element to work:
	 *
	 * ```ts
	 * const myRawElement = downcastWriter.createRawElement( 'div' );
	 *
	 * myRawElement.render = function( domElement, domConverter ) {
	 * 	domConverter.setContentOf( domElement, '<b>This is the raw content of myRawElement.</b>' );
	 * };
	 * ```
	 *
	 * @param domElement The native DOM element representing the raw view element.
	 * @param domConverter Instance of the DomConverter used to optimize the output.
	 */
	public render( domElement: DomElement, domConverter: DomConverter ): void {}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
RawElement.prototype.is = function( type: string, name?: string ): boolean {
	if ( !name ) {
		return type === 'rawElement' || type === 'view:rawElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === this.name || type === 'view:' + this.name ||
			type === 'element' || type === 'view:element' ||
			type === 'node' || type === 'view:node';
	} else {
		return name === this.name && (
			type === 'rawElement' || type === 'view:rawElement' ||
			type === 'element' || type === 'view:element'
		);
	}
};

/**
 * Returns `null` because block filler is not needed for raw elements.
 */
function getFillerOffset() {
	return null;
}
