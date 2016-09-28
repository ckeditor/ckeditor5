/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '../engine/view/containerelement.js';

/**
 * View element class representing list item (`<li>`). It extends {@link engine.view.ContainerElement} and overwrites
 * {@link list.ViewListItemElement#getFillerOffset evaluating whether filler offset} is needed.
 *
 * @memberOf list
 * @extends engine.view.ContainerElement
 */
export default class ViewListItemElement extends ViewContainerElement {
	/**
	 * Creates `<li>` view item.
	 *
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {engine.view.Node|Iterable.<engine.view.Node>} [children] List of nodes to be inserted into created element.
	 */
	constructor( attrs, children ) {
		super( 'li', attrs, children );
	}

	/**
	 * @inheritDoc
	 */
	getFillerOffset() {
		const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

		return this.isEmpty || hasOnlyLists ? 0 : null;
	}
}
