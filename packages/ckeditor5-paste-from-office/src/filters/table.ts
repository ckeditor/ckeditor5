/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/table
 */

import {
	type UpcastWriter,
	type ViewDocumentFragment
} from 'ckeditor5/src/engine.js';

import {
	convertCssLengthToPx,
	isPx
} from './utils.js';

/**
 * TODO
 */
export default function transformTables(
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): void {
	for ( const item of writer.createRangeIn( documentFragment ).getItems() ) {
		if (
			!item.is( 'element', 'table' ) &&
			!item.is( 'element', 'td' ) &&
			!item.is( 'element', 'th' )
		) {
			continue;
		}

		const sides = [ 'left', 'top', 'right', 'bottom' ];

		// As this is a pasted table, we do not want default table styles to apply here
		// so we set border node for sides that does not have any border style.
		// It is enough to verify border style as border color and border width properties have default values in DOM.
		for ( const side of sides ) {
			if ( !item.hasStyle( `border-${ side }-style` ) ) {
				writer.setStyle( `border-${ side }`, 'none', item );
			}
		}

		// Translate length units to px.
		const props = [ 'width', 'height', ...sides.map( side => `border-${ side }-width` ) ];

		for ( const prop of props ) {
			if ( item.hasStyle( prop ) && !isPx( item.getStyle( prop ) ) ) {
				writer.setStyle( prop, convertCssLengthToPx( item.getStyle( prop )! ), item );
			}
		}
	}
}
