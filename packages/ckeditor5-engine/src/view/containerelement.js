/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/containerelement
 */

import Element from './element';

/**
 * Containers are elements which define document structure. They define boundaries for
 * {@link module:engine/view/attributeelement~AttributeElement attributes}. They are mostly use for block elements like `<p>` or `<div>`.
 *
 * Editing engine does not define fixed HTML DTD. This is why the type of the {@link module:engine/view/element~Element} need to
 * be defined by the feature developer.
 *
 * Creating an element you should use `ContainerElement` class or {@link module:engine/view/attributeelement~AttributeElement}. This is
 * important to define the type of the element because of two reasons:
 *
 * Firstly, {@link module:engine/view/domconverter~DomConverter} needs the information what is an editable block to convert elements to
 * DOM properly. {@link module:engine/view/domconverter~DomConverter} will ensure that `ContainerElement` is editable and it is possible
 * to put caret inside it, even if the container is empty.
 *
 * Secondly, {@link module:engine/view/writer~writer view writer} uses this information.
 * Nodes {@link module:engine/view/writer~writer.breakAttributes breaking} and {@link module:engine/view/writer~writer.mergeAttributes
 * merging}
 * is performed only in a bounds of a container nodes.
 *
 * For instance if `<p>` is an container and `<b>` is attribute:
 *
 *		<p><b>fo^o</b></p>
 *
 * {@link module:engine/view/writer~writer.breakAttributes breakAttributes} will create:
 *
 *		<p><b>fo</b><b>o</b></p>
 *
 * There might be a need to mark `<span>` element as a container node, for example in situation when it will be a
 * container of an inline widget:
 *
 *		<span color="red">foobar</span>		// attribute
 *		<span data-widget>foobar</span>		// container
 *
 * @extends module:engine/view/element~Element
 */
export default class ContainerElement extends Element {
	/**
	 * Creates a container element.
	 *
	 * @see module:engine/view/element~Element
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

// Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getFillerOffset() {
	for ( const child of this.getChildren() ) {
		// If there's any non-UI element – don't render the bogus.
		if ( !child.is( 'uiElement' ) ) {
			return null;
		}
	}

	// If there are only UI elements – render the bogus at the end of the element.
	return this.childCount;
}
