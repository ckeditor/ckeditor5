/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals HTMLTextAreaElement */

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
	updateSourceElement( data = this.data.get() ) {
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
				'editor-missing-sourceelement',
				this
			);
		}

		const shouldUpdateSourceElement = this.config.get( 'updateSourceElementOnDestroy' );
		const isSourceElementTextArea = this.sourceElement instanceof HTMLTextAreaElement;

		// The data returned by the editor might be unsafe, so we want to prevent rendering
		// unsafe content inside the source element different than <textarea>, which is considered
		// secure. This behaviour could be changed by setting the `updateSourceElementOnDestroy`
		// configuration option to `true`.
		if ( !shouldUpdateSourceElement && !isSourceElementTextArea ) {
			setDataInElement( this.sourceElement, '' );

			return;
		}

		setDataInElement( this.sourceElement, data );
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
 * @param {String} data The data that should be used to update the source element.
 * By default, it is taken directly from the existing editor instance.
 */
