/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
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
	updateSourceElement() {
		if ( !this.sourceElement ) {
			/**
			 * In case of the editor is creating using an initial data instead of the DOM element,
			 * the {@link ElementApi~updateSourceElement `updateSourceElement()`} method cannot be called because there is no
			 * {@link ElementApi~sourceElement `sourceElement`} that could be updated.
			 *
			 * @error elementapimixin-missing-sourceelement
			 */
			throw new CKEditorError( 'elementapi-missing-sourceelement: The "sourceElement" is required by the "ElementApi" interface.' );
		}

		setDataInElement( this.sourceElement, this.data.get() );
	}
};

export default ElementApiMixin;

/**
 * Interface describing an editor which replaced a DOM element (was "initialized on an element").
 *
 * Such an editor should provide a method to
 * {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement update the replaced element with the current data}.
 *
 * @interface ElementApi
 */

/**
 * The element on which the editor has been initialized.
 *
 * @readonly
 * @member {HTMLElement} #sourceElement
 */

/**
 * Updates the {@link #sourceElement editor source element}'s content with the data.
 *
 * @method #updateSourceElement
 */
