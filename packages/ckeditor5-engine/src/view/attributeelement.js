/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/attributeelement
 */

import Element from './element.js';

// Default attribute priority.
const DEFAULT_PRIORITY = 10;

/**
 * Attributes are elements which define document presentation. They are mostly elements like `<b>` or `<span>`.
 * Attributes can be broken and merged by the {@link module:engine/view/writer~writer view writer}.
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
	 * @see module:engine/view/element~Element
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * Element priority. Attributes have to have the same priority to be
		 * {@link module:engine/view/element~Element#isSimilar similar}. Setting different priorities on similar
 		 * nodes may prevent merging, e.g. two `<abbr>` nodes next each other shouldn't be merged.
		 *
		 * @member {Number}
		 */
		this.priority = DEFAULT_PRIORITY;

		/**
		 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
		 *
		 * @method #getFillerOffset
		 * @returns {Number|null} Block filler offset or `null` if block filler is not needed.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Clones provided element with priority.
	 *
	 * @param {Boolean} deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {module:engine/view/attributeelement~AttributeElement} Clone of this element.
	 */
	clone( deep ) {
		const cloned = super.clone( deep );

		// Clone priority too.
		cloned.priority = this.priority;

		return cloned;
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
	/*jshint validthis:true */

	// <b>foo</b> does not need filler.
	if ( this.childCount ) {
		return null;
	}

	let element = this.parent;

	// <p><b></b></p> needs filler -> <p><b><br></b></p>
	while ( element instanceof AttributeElement ) {
		if ( element.childCount > 1 ) {
			return null;
		}

		element = element.parent;
	}

	if ( !element || element.childCount > 1 ) {
		return null;
	}

	return 0;
}
