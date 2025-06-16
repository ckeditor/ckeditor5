/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/removeinvalidtablewidth
 */

import type { ViewUpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine.js';

/**
 * Removes the `width:0px` style from table pasted from Google Sheets.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 * @internal
 */
export function removeInvalidTableWidth( documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter ): void {
	for ( const child of documentFragment.getChildren() ) {
		if ( child.is( 'element', 'table' ) && child.getStyle( 'width' ) === '0px' ) {
			writer.removeStyle( 'width', child );
		}
	}
}
