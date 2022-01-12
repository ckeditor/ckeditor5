/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module word-count/utils
 */

/**
 * Returns a plain text representation of an element and its children.
 *
 * @param {module:engine/model/element~Element} element
 * @returns {String} Plain text representing the model's data.
 */
export function modelElementToPlainText( element ) {
	if ( element.is( '$text' ) || element.is( '$textProxy' ) ) {
		return element.data;
	}

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
