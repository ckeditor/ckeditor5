/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @module core/editor/utils/securesourceelement
 */

const SECURE_ATTRIBUTE = 'data-ckeditor5';

/**
 * Checks if the editor was initialized using a source element. If yes, it prevents to creating another editor
 * using the same source element. In other words, you cannot use the same source element more than once.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 */
export default function secureSourceElement( editor ) {
	const sourceElement = editor.sourceElement;

	// If the editor was initialized without specifying an element, we don't need to secure anything.
	if ( !sourceElement ) {
		return;
	}

	if ( sourceElement.hasAttribute( SECURE_ATTRIBUTE ) ) {
		/**
		 * An element passed to the editor creator has been passed more than once. The element can be used only once.
		 *
		 * @error securesourceelement-source-element-used-more-than-once
		 */
		throw new CKEditorError(
			'securesourceelement-source-element-used-more-than-once: ' +
			'The editor cannot be initialized using the same source element more than once.'
		);
	}

	// Mark the source element.
	sourceElement.setAttribute( SECURE_ATTRIBUTE, 'true' );

	// Remove the attribute when the editor is being destroyed.
	editor.once( 'destroy', () => {
		sourceElement.removeAttribute( SECURE_ATTRIBUTE );
	} );
}
