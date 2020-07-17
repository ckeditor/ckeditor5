/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into created element.
	 */
	constructor( document, name, attrs, children ) {
		super( document, name, attrs, children );

		/**
		 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
		 *
		 * @method #getFillerOffset
		 * @returns {Number|null} Block filler offset or `null` if block filler is not needed.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		containerElement.is( 'containerElement' ); // -> true
	 *		containerElement.is( 'element' ); // -> true
	 *		containerElement.is( 'node' ); // -> true
	 *		containerElement.is( 'view:containerElement' ); // -> true
	 *		containerElement.is( 'view:element' ); // -> true
	 *		containerElement.is( 'view:node' ); // -> true
	 *
	 *		containerElement.is( 'model:element' ); // -> false
	 *		containerElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is a container element, you can also check its
	 * {@link module:engine/view/containerelement~ContainerElement#name name}:
	 *
	 *		containerElement.is( 'element', 'div' ); // -> true if this is a div container element
	 *		containerElement.is( 'contaienrElement', 'div' ); // -> same as above
	 *		text.is( 'element', 'div' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type === 'containerElement' || type === 'view:containerElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === this.name || type === 'view:' + this.name ||
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'containerElement' || type === 'view:containerElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === 'element' || type === 'view:element'
			);
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
