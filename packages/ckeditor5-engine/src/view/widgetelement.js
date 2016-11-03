/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Element from './element.js';

export default class WidgetElement extends Element {
	constructor( name, attributes, children  ) {
		super( name, attributes, children  );

		// Set content editable attribute to false for all WidgetElements.
		this.setAttribute( 'contenteditable', false );
	}

	/**
	 * Returns `null` because block filler is not needed.
	 *
	 * @returns {null}
	 */
	getFillerOffset() {
		return null;
	}
}
