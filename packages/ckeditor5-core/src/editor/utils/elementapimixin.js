/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';

/**
 * @module core/editor/utils/elementapimixin
 */

const SECURE_SOURCE_ELEMENT_ATTRIBUTE = 'data-ckeditor5-element';

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
	},

	/**
	 * Marks the source element the editor was initialized on preventing other editor instances from
	 * using this element.
	 *
	 * Running multiple editor instances on the same source element causes various issues and it is
	 * crucial this helper is called as soon as the source element is known to prevent collisions.
	 */
	secureSourceElement() {
		const sourceElement = this.sourceElement;

		// If the editor was initialized without specifying an element, we don't need to secure anything.
		if ( !sourceElement ) {
			return;
		}

		if ( sourceElement.hasAttribute( SECURE_SOURCE_ELEMENT_ATTRIBUTE ) ) {
			/**
			 * A DOM element used to create the editor (e.g.
			 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`})
			 * has already been used to create another editor instance. Make sure each editor is
			 * created with an unique DOM element.
			 *
			 * @error editor-source-element-used-more-than-once
			 */
			throw new CKEditorError(
				'editor-source-element-used-more-than-once: ' +
				'The DOM source element cannot be used to create an editor more than once.'
			);
		}

		sourceElement.setAttribute( SECURE_SOURCE_ELEMENT_ATTRIBUTE, 'true' );

		this.once( 'destroy', () => {
			sourceElement.removeAttribute( SECURE_SOURCE_ELEMENT_ATTRIBUTE );
		} );
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
