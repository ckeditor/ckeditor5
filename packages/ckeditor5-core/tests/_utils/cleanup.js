/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Removes all the `.ck-body` elements available in the DOM.
 *
 * It is commonly used to cleanup after editors that test editor crashes.
 *
 * See https://github.com/ckeditor/ckeditor5/issues/6018 for more details.
 */
export function removeEditorBodyOrphans() {
	for ( const bodyOrphan of document.querySelectorAll( '.ck-body-wrapper' ) ) {
		bodyOrphan.remove();
	}
}
