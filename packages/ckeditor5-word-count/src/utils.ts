/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module word-count/utils
 */

import type { Element, Item } from 'ckeditor5/src/engine.js';

/**
 * Returns a plain text representation of an element and its children.
 *
 * @returns Plain text representing the model's data.
 */
export function modelElementToPlainText( item: Item ): string {
	if ( item.is( '$text' ) || item.is( '$textProxy' ) ) {
		return item.data;
	}

	const element = item as Element;
	let text = '';
	let prev = null;

	for ( const child of element.getChildren() ) {
		const childText = modelElementToPlainText( child );

		// If last block was finish, start from new line.
		if ( prev && prev.is( 'element' ) ) {
			text += '\n';
		}

		text += childText;

		prev = child;
	}

	return text;
}
