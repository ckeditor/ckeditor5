/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

import { insertImage, isImageAllowed } from './utils';

/**
 * @module image/image/imageinsertcommand
 */

/**
 * Insert image command.
 *
 * The command is registered by the {@link module:image/image/imageediting~ImageEditing} plugin as `'imageInsert'`.
 *
 * In order to insert an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and specify the image source:
 *
 *		editor.execute( 'imageInsert', { source: 'http://url.to.the/image' } );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'imageInsert', {
 *			source:  [
 *				'path/to/image.jpg',
 *				'path/to/other-image.jpg'
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class ImageInsertCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isImageAllowed( this.editor );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {String|Array.<String>} options.source The image source or an array of image sources to insert.
	 */
	execute( options ) {
		const sources = toArray( options.source );
		const selection = this.editor.model.document.selection;

		for ( const src of sources ) {
			// Inserting of an inline image replace the selected element and make a selection on the inserted image.
			// Therefore inserting multiple inline images requires creating position after each element.
			if ( sources.length > 1 && selection.getSelectedElement() && selection.getSelectedElement().name === 'imageInline' ) {
				const position = this.editor.model.createPositionAfter( selection.getSelectedElement() );
				insertImage( this.editor, { src }, position );
			} else {
				insertImage( this.editor, { src } );
			}
		}
	}
}
