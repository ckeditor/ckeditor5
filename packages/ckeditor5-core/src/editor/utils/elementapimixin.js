/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';

/**
 * @module core/editor/utils/elementapimixin
 */

/**
 * Mixin provides method for setting and getting data from/to element on which editor has been initialized.
 *
 * @mixin ElementApiMixin
 * @implements module:core/editor/utils/elementapimixin~ElementApi
 */
const ElementApiMixin = {
	/**
	 * @inheritDoc
	 */
	updateElement() {
		setDataInElement( this.element, this.data.get() );
	},

	/**
	 * @inheritDoc
	 */
	loadDataFromElement() {
		this.data.set( getDataFromElement( this.element ) );
	}
};

export default ElementApiMixin;

/**
 * Interface representing classes which mix in {@link module:core/editor/utils/elementapimixin~ElementApiMixin}.
 *
 * @interface ElementApi
 */

/**
 * The element on which the editor has been initialized.
 *
 * @readonly
 * @member {HTMLElement} #element
 */

/**
 * Updates the {@link #element editor element}'s content with the data.
 *
 * @method #updateElement
 */

/**
 * Loads the data from the {@link #element editor element} to the main root.
 *
 * @method #loadDataFromElement
 */
