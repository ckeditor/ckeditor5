/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/removexmlns
 */

import type { UpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine.js';

/**
 * Removes the `xmlns` attribute from table pasted from Google Sheets.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 */
export default function removeXmlns( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): void {
	for ( const child of documentFragment.getChildren() ) {
		if ( child.is( 'element', 'table' ) && child.hasAttribute( 'xmlns' ) ) {
			writer.removeAttribute( 'xmlns', child );
		}
	}
}
