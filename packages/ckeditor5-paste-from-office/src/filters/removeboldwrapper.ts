/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/removeboldwrapper
 */

import type { UpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine';

/**
 * Removes `<b>` tag wrapper added by Google Docs to a copied content.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 */
export default function removeBoldWrapper( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): void {
	for ( const child of documentFragment.getChildren() ) {
		if ( child.is( 'element', 'b' ) && child.getStyle( 'font-weight' ) === 'normal' ) {
			const childIndex = documentFragment.getChildIndex( child );

			writer.remove( child );
			writer.insertChild( childIndex, child.getChildren(), documentFragment );
		}
	}
}
