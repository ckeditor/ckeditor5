/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/removegooglesheetstag
 */

import type { UpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine.js';

/**
 * Removes the `<google-sheets-html-origin>` tag wrapper added by Google Sheets to a copied content.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 */
export default function removeGoogleSheetsTag( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): void {
	for ( const child of documentFragment.getChildren() ) {
		if ( child.is( 'element', 'google-sheets-html-origin' ) ) {
			const childIndex = documentFragment.getChildIndex( child );

			writer.remove( child );
			writer.insertChild( childIndex, child.getChildren(), documentFragment );
		}
	}
}
