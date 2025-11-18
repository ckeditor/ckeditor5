/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/table
 */

import {
	type ViewUpcastWriter,
	type ViewDocumentFragment
} from 'ckeditor5/src/engine.js';

import { convertCssLengthToPx } from './utils.js';

/**
 * Applies border none for table and cells without a border specified.
 * Normalizes style length units to px.
 * Handles left block table alignment.
 *
 * @internal
 */
export function transformTables(
	documentFragment: ViewDocumentFragment,
	writer: ViewUpcastWriter,
	hasTablePropertiesPlugin: boolean
): void {
	for ( const item of writer.createRangeIn( documentFragment ).getItems() ) {
		if (
			!item.is( 'element', 'table' ) &&
			!item.is( 'element', 'td' ) &&
			!item.is( 'element', 'th' )
		) {
			continue;
		}

		// In MS Word, left aligned tables (default) have no align attribute on table and are not wrapped in a div.
		// In such case we need to set margin-left: 0 and margin-right: auto to let the editor know that the table is left block aligned.
		// Other alignments are handled by dedicated upcast converters in Table feature.
		if ( hasTablePropertiesPlugin && item.is( 'element', 'table' ) ) {
			const hasDivParent = item.parent && item.parent.is( 'element', 'div' );

			if ( !item.getAttribute( 'align' ) && !hasDivParent ) {
				writer.setStyle( 'margin-left', '0', item );
				writer.setStyle( 'margin-right', 'auto', item );
			}
		}

		const sides = [ 'left', 'top', 'right', 'bottom' ];

		// As this is a pasted table, we do not want default table styles to apply here
		// so we set border node for sides that does not have any border style.
		// It is enough to verify border style as border color and border width properties have default values in DOM.
		if ( sides.every( side => !item.hasStyle( `border-${ side }-style` ) ) ) {
			writer.setStyle( 'border-style', 'none', item );
		} else {
			for ( const side of sides ) {
				if ( !item.hasStyle( `border-${ side }-style` ) ) {
					writer.setStyle( `border-${ side }-style`, 'none', item );
				}
			}
		}

		// Translate style length units to px.
		const props = [
			'width',
			'height',
			...sides.map( side => `border-${ side }-width` ),
			...sides.map( side => `padding-${ side }` )
		];

		for ( const prop of props ) {
			if ( item.hasStyle( prop ) ) {
				writer.setStyle( prop, convertCssLengthToPx( item.getStyle( prop )! ), item );
			}
		}
	}
}
