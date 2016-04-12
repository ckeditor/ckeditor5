/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';

export const DEFAULT_PRIORITY = 10;

/**
 * Attributes are elements which define document presentation. They are mostly elements like `<b>` or `<span>`.
 * Attributes can be broken and merged by the {@link engine.treeView.Writer}. Merging requires that attribute nodes are
 * {@link engine.treeView.Element#isSimilar similar} and have same priority. Setting different priorities on similar
 * nodes may prevent merging, eg. two `<abbr>` nodes next each other shouldn't be merged.
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
		 * Element priority.
		 *
		 * @member {Number} engine.treeView.AttributeElement#priority
		 */
		this.priority = DEFAULT_PRIORITY;
	}
}
