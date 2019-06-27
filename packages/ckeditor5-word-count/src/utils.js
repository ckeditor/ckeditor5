/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module wordcount/utils
 */

/**
 * Returns plain text representation of an element and it's children. The blocks are separated by a newline (\n ).
 *
 * **Note:** Function walks through the entire model, which might be very spread. There should be considered throttling it during usage.
 *
 * @param {module:engine/model/element~Element} element
 * @returns {String} Plain text representing model's data
 */
export function modelElementToPlainText( element ) {
	if ( element.is( 'text' ) || element.is( 'textProxy' ) ) {
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
