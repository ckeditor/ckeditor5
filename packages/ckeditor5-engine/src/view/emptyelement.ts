/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/emptyelement
 */

import { ViewElement, type ViewElementAttributes } from './element.js';
import { ViewNode } from './node.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { type ViewDocument } from './document.js';
import { type ViewItem } from './item.js';

/**
 * Empty element class. It is used to represent elements that cannot contain any child nodes (for example `<img>` elements).
 *
 * To create a new empty element use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEmptyElement `downcastWriter#createEmptyElement()`} method.
 */
export class ViewEmptyElement extends ViewElement {
	/**
	 * Creates new instance of ViewEmptyElement.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` when third parameter is passed,
	 * to inform that usage of ViewEmptyElement is incorrect (adding child nodes to ViewEmptyElement is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~ViewDowncastWriter#createEmptyElement
	 * @internal
	 * @param document The document instance to which this element belongs.
	 * @param name Node name.
	 * @param attributes Collection of attributes.
	 * @param children A list of nodes to be inserted into created element.
	 */
	constructor(
		document: ViewDocument,
		name: string,
		attributes?: ViewElementAttributes,
		children?: ViewNode | Iterable<ViewNode>
	) {
		super( document, name, attributes, children );

		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Overrides {@link module:engine/view/element~ViewElement#_insertChild} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent
	 * adding any child nodes to ViewEmptyElement.
	 *
	 * @internal
	 */
	public override _insertChild( index: number, items: ViewItem | Iterable<ViewItem> ): number {
		if ( items && ( items instanceof ViewNode || Array.from( items as Iterable<ViewItem> ).length > 0 ) ) {
			/**
			 * Cannot add children to {@link module:engine/view/emptyelement~ViewEmptyElement}.
			 *
			 * @error view-emptyelement-cannot-add
			 */
			throw new CKEditorError(
				'view-emptyelement-cannot-add',
				[ this, items ]
			);
		}

		return 0;
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewEmptyElement.prototype.is = function( type: string, name?: string ): boolean {
	if ( !name ) {
		return type === 'emptyElement' || type === 'view:emptyElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'view:element' ||
			type === 'node' || type === 'view:node';
	} else {
		return name === this.name && (
			type === 'emptyElement' || type === 'view:emptyElement' ||
			type === 'element' || type === 'view:element'
		);
	}
};

/**
 * Returns `null` because block filler is not needed for ViewEmptyElements.
 */
function getFillerOffset() {
	return null;
}
