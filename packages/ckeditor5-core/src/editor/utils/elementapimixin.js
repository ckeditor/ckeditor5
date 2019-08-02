/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
			 * Cannot update the source element of a detached editor.
			 *
			 * The {@link ~ElementApi#updateSourceElement `updateSourceElement()`} method cannot be called if you did not
			 * pass an element to `Editor.create()`.
			 *
			 * @error editor-missing-sourceelement
			 */
			throw new CKEditorError(
				'editor-missing-sourceelement: Cannot update the source element of a detached editor.',
				this
			);
		}

		setDataInElement( this.sourceElement, this.data.get() );
	}
};

export default ElementApiMixin;

/**
 * Interface describing an editor that replaced a DOM element (was "initialized on an element").
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
