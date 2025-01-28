/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/removestyleblock
 */

import type { UpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine.js';

/**
 * Removes `<style>` block added by Google Sheets to a copied content.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 */
export default function removeStyleBlock( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): void {
	for ( const child of Array.from( documentFragment.getChildren() ) ) {
		if ( child.is( 'element', 'style' ) ) {
			writer.remove( child );
		}
	}
}
