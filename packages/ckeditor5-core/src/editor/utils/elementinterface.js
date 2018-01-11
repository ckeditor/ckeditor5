/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';

/**
 * @module core/editor/utils/elementinterface
 */

/**
 * @mixin module:core/editor/utils/elementinterface~ElementInterface
 */
const ElementInterface = {
	/**
	 * The element on which the editor has been initialized.
	 *
	 * @readonly
	 * @property module:core/editor/utils/elementinterface~ElementInterface#element
	 * @type {HTMLElement}
	 */
	element: null,

	/**
	 * Updates the {@link #element editor element}'s content with the data.
	 *
	 * @method module:core/editor/utils/elementinterface~ElementInterface#updateElement
	 */
	updateElement() {
		setDataInElement( this.element, this.data.get() );
	},

	/**
	 * Loads the data from the {@link #element editor element} to the main root.
	 *
	 * @method module:core/utils/elementinterface~ElementInterface#loadDataFromElement
	 */
	loadDataFromElement() {
		this.data.set( getDataFromElement( this.element ) );
	}
};

export default ElementInterface;
