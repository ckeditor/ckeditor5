/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/containerelement
 */

import Element from './element';

/**
 * Containers are elements which define document structure. They define boundaries for
 * {@link module:engine/view/attributeelement~AttributeElement attributes}. They are mostly used for block elements like `<p>` or `<div>`.
 *
 * Editing engine does not define a fixed HTML DTD. This is why a feature developer needs to choose between various
 * types (container element, {@link module:engine/view/attributeelement~AttributeElement attribute element},
 * {@link module:engine/view/emptyelement~EmptyElement empty element}, etc) when developing a feature.
 *
 * The container element should be your default choice when writing a converter, unless:
 *
 * * this element represents a model text attribute (then use {@link module:engine/view/attributeelement~AttributeElement}),
 * * this is an empty element like `<img>` (then use {@link module:engine/view/emptyelement~EmptyElement}),
 * * this is a root element,
 * * this is a nested editable element (then use  {@link module:engine/view/editableelement~EditableElement}).
 *
 * To create a new container element instance use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement `DowncastWriter#createContainerElement()`}
 * method.
 *
 * @extends module:engine/view/element~Element
 */
export default class ContainerElement extends Element {
	/**
	 * Creates a container element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createContainerElement
	 * @see module:engine/view/element~Element
	 * @protected
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
		 *
		 * @method #getFillerOffset
		 * @returns {Number|null} Block filler offset or `null` if block filler is not needed.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * @inheritDoc
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'containerElement' || super.is( type );
		} else {
			return ( type == 'containerElement' && name == this.name ) || super.is( type, name );
		}
	}
}

/**
 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
 *
 * @returns {Number|null} Block filler offset or `null` if block filler is not needed.
 */
export function getFillerOffset() {
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
