/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/parse
 */
import { UpcastWriter, type ViewDocumentFragment } from 'ckeditor5/src/engine';

/**
 * Set alignment for table pasted from MS Word.
 *
 * @param documentFragment The view structure to be transformed.
 */
export function setTableAlignment( documentFragment: ViewDocumentFragment ): void {
	const upcastWriter = new UpcastWriter( documentFragment.document );

	for ( const item of documentFragment.getChildren() ) {
		if ( !item.is( 'element' ) ) {
			continue;
		}

		// If table is not wrapped in div[align] it should be alligned left.
		// More details:(https://github.com/ckeditor/ckeditor5/issues/8752#issuecomment-1623507171).
		if ( item.is( 'element', 'table' ) ) {
			upcastWriter.setAttribute( 'align', 'left', item );
			continue;
		}

		const align = item.getAttribute( 'align' );
		const child = item.getChild( 0 );

		// Element should have alignment attribute and should have child and should be div.
		if ( !align || !child || item.name !== 'div' ) {
			continue;
		}

		// If table is wrapped in div[align] table should be alligned with defined alignment value.
		// More details:(https://github.com/ckeditor/ckeditor5/issues/8752#issuecomment-1629065676)
		if ( child.is( 'element', 'table' ) ) {
			upcastWriter.setAttribute( 'align', align === 'center' ? 'none' : align, child );
		}
	}
}
