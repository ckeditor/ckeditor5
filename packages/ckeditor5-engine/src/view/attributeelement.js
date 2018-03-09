/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/attributeelement
 */

import Element from './element';

// Default attribute priority.
const DEFAULT_PRIORITY = 10;

/**
 * Attributes are elements which define document presentation. They are mostly elements like `<b>` or `<span>`.
 * Attributes can be broken and merged by the {@link module:engine/view/writer~Writer view writer}.
 *
 * Editing engine does not define fixed HTML DTD. This is why the type of the {@link module:engine/view/element~Element} need to
 * be defined by the feature developer. Creating an element you should use {@link module:engine/view/containerelement~ContainerElement}
 * class or `AttributeElement`.
 *
 * @extends module:engine/view/element~Element
 */
export default class AttributeElement extends Element {
	/**
	 * Creates a attribute element.
	 *
	 * @see module:engine/view/writer~Writer#createAttributeElement
	 * @protected
	 * @see module:engine/view/element~Element
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * Element priority. Attributes have to have the same priority to be
		 * {@link module:engine/view/element~Element#isSimilar similar}. Setting different priorities on similar
 		 * nodes may prevent merging, e.g. two `<abbr>` nodes next each other shouldn't be merged.
		 *
		 * @protected
		 * @member {Number}
		 */
		this._priority = DEFAULT_PRIORITY;

		/**
		 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
		 *
		 * @method #getFillerOffset
		 * @returns {Number|null} Block filler offset or `null` if block filler is not needed.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Priority of this element.
	 *
	 * @readonly
	 * @return {Number}
	 */
	get priority() {
		return this._priority;
	}

	/**
	 * @inheritDoc
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'attributeElement' || super.is( type );
		} else {
			return ( type == 'attributeElement' && name == this.name ) || super.is( type, name );
		}
	}

	/**
	 * Checks if this element is similar to other element.
	 * Both elements should have the same name, attributes and priority to be considered as similar.
	 * Two similar elements can contain different set of children nodes.
	 *
	 * @param {module:engine/view/element~Element} otherElement
	 * @returns {Boolean}
	 */
	isSimilar( otherElement ) {
		return super.isSimilar( otherElement ) && this.priority == otherElement.priority;
	}

	/**
	 * Clones provided element with priority.
	 *
	 * @protected
	 * @param {Boolean} deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {module:engine/view/attributeelement~AttributeElement} Clone of this element.
	 */
	_clone( deep ) {
		const cloned = super._clone( deep );

		// Clone priority too.
		cloned._priority = this._priority;

		return cloned;
	}
}

/**
 * Default attribute priority.
 *
 * @member {Number} module:engine/view/attributeelement~AttributeElement.DEFAULT_PRIORITY
 */
AttributeElement.DEFAULT_PRIORITY = DEFAULT_PRIORITY;

// Returns block {@link module:engine/view/filler~Filler filler} offset or `null` if block filler is not needed.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getFillerOffset() {
	// <b>foo</b> does not need filler.
	if ( nonUiChildrenCount( this ) ) {
		return null;
	}

	let element = this.parent;

	// <p><b></b></p> needs filler -> <p><b><br></b></p>
	while ( element && element.is( 'attributeElement' ) ) {
		if ( nonUiChildrenCount( element ) > 1 ) {
			return null;
		}

		element = element.parent;
	}

	if ( !element || nonUiChildrenCount( element ) > 1 ) {
		return null;
	}

	// Render block filler at the end of element (after all ui elements).
	return this.childCount;
}

// Returns total count of children that are not {@link module:engine/view/uielement~UIElement UIElements}.
//
// @param {module:engine/view/element~Element} element
// @return {Number}
function nonUiChildrenCount( element ) {
	return Array.from( element.getChildren() ).filter( element => !element.is( 'uiElement' ) ).length;
}
