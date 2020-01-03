/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

/**
 * Removes all the `.ck-body` elements available in the DOM.
 *
 * It is commonly used to cleanup after editors that test editor crashes.
 *
 * See https://github.com/ckeditor/ckeditor5/issues/6018 for more details.
 */
export function removeEditorBodyOrphans() {
	for ( const bodyOrphan of document.querySelectorAll( '.ck-body' ) ) {
		bodyOrphan.remove();
	}
}

/**
 * Searches for orphaned editors based on DOM.
 *
 * This is useful if in your tests you have no access to editor, instance because editor
 * creation method doesn't complete in a graceful manner.
 */
export function destroyEditorOrphans() {
	const promises = [];

	for ( const editableOrphan of document.querySelectorAll( '.ck-editor__editable' ) ) {
		if ( editableOrphan.ckeditorInstance ) {
			promises.push( editableOrphan.ckeditorInstance.destroy() );
		}
	}

	return Promise.all( promises );
}
