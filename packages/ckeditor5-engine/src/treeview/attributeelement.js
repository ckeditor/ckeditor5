/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';
import ContainerElement from './containerelement.js';

// Default attribute priority.
const DEFAULT_PRIORITY = 10;

/**
 * Attributes are elements which define document presentation. They are mostly elements like `<b>` or `<span>`.
 * Attributes can be broken and merged by the {@link engine.treeView.Writer}.
 *
 * Editing engine does not define fixed HTML DTD. This is why the type of the {@link engine.treeView.Element} need to
 * be defined by the feature developer. Creating an element you should use {@link engine.treeView.ContainerElement}
 * class or `AttributeElement`.
 *
 * @memberOf engine.treeView
 * @extends engine.treeView.Element
 */
export default class AttributeElement extends Element {
	/**
	 * Creates a attribute element.
	 *
	 * @see engine.treeView.Element
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * Element priority. Attributes have to have the same priority to be
		 * {@link engine.treeView.Element#isSimilar similar}. Setting different priorities on similar
 		 * nodes may prevent merging, eg. two `<abbr>` nodes next each other shouldn't be merged.
		 *
		 * @member {Number} engine.treeView.AttributeElement#priority
		 */
		this.priority = DEFAULT_PRIORITY;
	}

	/**
	 * Clones provided element with priority.
	 *
	 * @param {Boolean} deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {engine.treeView.AttributeElement} Clone of this element.
	 */
	clone( deep ) {
		const cloned = super.clone( deep );

		// Clone priority too.
		cloned.priority	= this.priority;

		return cloned;
	}

	/**
	 * Checks if this element is similar to other element.
	 * Both elements should have the same name, attributes and priority to be considered as similar.
	 * Two similar elements can contain different set of children nodes.
	 *
	 * @param {engine.treeView.Element} otherElement
	 * @returns {Boolean}
	 */
	isSimilar( otherElement ) {
		return super.isSimilar( otherElement ) && this.priority == otherElement.priority;
	}

	/**
	 * Returns block {@link engine.treeView.filler filler} offset or null if block filler is not needed.
	 *
	 * @returns {Number|false} Block filler offset or null if block filler is not needed.
	 */
	getFillerOffset() {
		// <b>foo</b> does not need filler
		if ( this.getChildCount() ) {
			return null;
		}

		let element = this.parent;

		// <p><b></b></p> needs filler -> <p><b><br></b></p>
		while ( !( element instanceof ContainerElement ) ) {
			if ( element.getChildCount() > 1 ) {
				return null;
			}
			element = element.parent;
		}

		if ( element.getChildCount() > 1 ) {
			return null;
		}

		return 0;
	}
}

/**
 * Default attribute priority.
 *
 * @member {Number} engine.treeView.AttributeElement.DEFAULT_PRIORITY
 */
AttributeElement.DEFAULT_PRIORITY = DEFAULT_PRIORITY;
