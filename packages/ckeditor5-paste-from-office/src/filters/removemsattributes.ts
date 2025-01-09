/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/removemsattributes
 */

import { UpcastWriter, type ViewDocumentFragment, type ViewElement } from 'ckeditor5/src/engine.js';

/**
 * Cleanup MS attributes like styles, attributes and elements.
 *
 * @param documentFragment element `data.content` obtained from clipboard.
 */
export default function removeMSAttributes( documentFragment: ViewDocumentFragment ): void {
	const elementsToUnwrap: Array<ViewElement> = [];

	const writer = new UpcastWriter( documentFragment.document );

	for ( const { item } of writer.createRangeIn( documentFragment ) ) {
		if ( !item.is( 'element' ) ) {
			continue;
		}

		for ( const className of item.getClassNames() ) {
			if ( /\bmso/gi.exec( className ) ) {
				writer.removeClass( className, item );
			}
		}

		for ( const styleName of item.getStyleNames() ) {
			if ( /\bmso/gi.exec( styleName ) ) {
				writer.removeStyle( styleName, item );
			}
		}

		if (
			item.is( 'element', 'w:sdt' ) ||
			item.is( 'element', 'w:sdtpr' ) && item.isEmpty ||
			item.is( 'element', 'o:p' ) && item.isEmpty
		) {
			elementsToUnwrap.push( item );
		}
	}

	for ( const item of elementsToUnwrap ) {
		const itemParent = item.parent!;
		const childIndex = itemParent.getChildIndex( item );

		writer.insertChild( childIndex, item.getChildren(), itemParent );
		writer.remove( item );
	}
}
