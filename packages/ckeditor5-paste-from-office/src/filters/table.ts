/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/table
 */

import {
	type UpcastWriter,
	type ViewDocumentFragment,
	type ViewElement
} from 'ckeditor5/src/engine.js';

import { convertCssLengthToPx } from './utils.js';

/**
 * Applies border none for table and cells without a border specified.
 * Normalizes style length units to px.
 */
export default function transformTables(
	documentFragment: ViewDocumentFragment,
	writer: UpcastWriter
): void {
	for ( const item of writer.createRangeIn( documentFragment ).getItems() ) {
		if (
			item.is( 'element', 'table' ) ||
			item.is( 'element', 'td' ) ||
			item.is( 'element', 'th' )
		) {
			normalizeBorders( item, writer );
			normalizeLengthProperties( item, writer );
		}

		if ( item.is( 'element', 'col' ) ) {
			normalizeLengthProperties( item, writer );
		}
	}
}

const sides = [ 'left', 'top', 'right', 'bottom' ];
const props = [
	'width',
	'height',
	...sides.map( side => `border-${ side }-width` ),
	...sides.map( side => `padding-${ side }` )
];

/**
 * As this is a pasted table, we do not want default table styles to apply here
 * so we set border node for sides that does not have any border style.
 * It is enough to verify border style as border color and border width properties have default values in DOM.
 */
function normalizeBorders( element: ViewElement, writer: UpcastWriter ) {
	if ( sides.every( side => !element.hasStyle( `border-${ side }-style` ) ) ) {
		writer.setStyle( 'border-style', 'none', element );
	} else {
		for ( const side of sides ) {
			if ( !element.hasStyle( `border-${ side }-style` ) ) {
				writer.setStyle( `border-${ side }-style`, 'none', element );
			}
		}
	}
}

/**
 * Normalizes length properties to px.
 */
function normalizeLengthProperties( element: ViewElement, writer: UpcastWriter ) {
	for ( const prop of props ) {
		if ( element.hasStyle( prop ) ) {
			writer.setStyle( prop, convertCssLengthToPx( element.getStyle( prop )! ), element );
		}
	}
}
