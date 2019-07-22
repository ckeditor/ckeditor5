/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @module core/editor/utils/securesourceelement
 */

/**
 * Marks the source element the editor was initialized on preventing other editor instances from
 * using this element.
 *
 * Running multiple editor instances on the same source element causes various issues and it is
 * crucial this helper is called as soon as the source element is known to prevent collisions.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 */
export default function secureSourceElement( editor ) {
	const sourceElement = editor.sourceElement;

	// If the editor was initialized without specifying an element, we don't need to secure anything.
	if ( !sourceElement ) {
		return;
	}

	if ( sourceElement.dataset.ckeditorSecuredElement ) {
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

	sourceElement.dataset.ckeditorSecuredElement = true;

	editor.once( 'destroy', () => {
		delete sourceElement.dataset.ckeditorSecuredElement;
	} );
}
