/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/legacyerrors
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

if ( false ) {
	/**
	 * The `EditorUI#_editableElements` property has been
	 * deprecated and will be removed in the near future. Please use
	 * {@link module:ui/editorui/editorui~EditorUI#setEditableElement `setEditableElement()`} and
	 * {@link module:ui/editorui/editorui~EditorUI#getEditableElement `getEditableElement()`} methods instead.
	 *
	 * @error editor-ui-deprecated-editable-elements
	 * @param {module:ui/editorui/editorui~EditorUI} editorUI Editor UI instance the deprecated property belongs to.
	 */
	throw new CKEditorError( 'editor-ui-deprecated-editable-elements', null );
}
