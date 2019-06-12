/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module wordcount/utils
 */

/**
 * Function walks through all the model's nodes. It obtains a plain text from each {@link module:engine/model/text~Text}
 * and {@link module:engine/model/textproxy~TextProxy}. All sections, which are not a text, are separated with a new line (`\n`).
 *
 * **Note:** Function walks through the entire model. There should be considered throttling during usage.
 *
 * @param {module:engine/model/node~Node} node
 * @returns {String} Plain text representing model's data
 */
export function modelElementToPlainText( node ) {
	let text = '';

	if ( node.is( 'text' ) || node.is( 'textProxy' ) ) {
		text += node.data;
	} else {
		let prev = null;

		for ( const child of node.getChildren() ) {
			const childText = modelElementToPlainText( child );

			// If last block was finish, start from new line.
			if ( prev && prev.is( 'element' ) ) {
				text += '\n';
			}

			text += childText;

			prev = child;
		}
	}

	return text;
}
