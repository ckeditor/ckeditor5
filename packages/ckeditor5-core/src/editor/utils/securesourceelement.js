/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @module core/editor/utils/securesourceelement
 */

/**
 * Marks the source element on which the editor was initialized. This prevents other editor instances from using this element.
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

	if ( sourceElement.ckeditorInstance ) {
		/**
		 * A DOM element used to create the editor (e.g.
		 * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`})
		 * has already been used to create another editor instance. Make sure each editor is
		 * created with an unique DOM element.
		 *
		 * @error editor-source-element-already-used
		 * @param {HTMLElement} element DOM element that caused the collision.
		 */
		throw new CKEditorError(
			'editor-source-element-already-used: ' +
			'The DOM element cannot be used to create multiple editor instances.',
			editor
		);
	}

	sourceElement.ckeditorInstance = editor;

	editor.once( 'destroy', () => {
		delete sourceElement.ckeditorInstance;
	} );
}
