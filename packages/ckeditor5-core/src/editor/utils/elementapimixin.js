/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';

/**
 * @module core/editor/utils/elementapimixin
 */

/**
 * Implementation of the {@link module:core/editor/utils/elementapimixin~ElementApi}.
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
	}
};

export default ElementApiMixin;

/**
 * Interface describing an editor which replaced a DOM element (was "initialized on an element").
 *
 * Such an editor should provide a method to
 * {@link module:core/editor/utils/elementapimixin~ElementApi#updateElement update the replaced element with the current data}.
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
