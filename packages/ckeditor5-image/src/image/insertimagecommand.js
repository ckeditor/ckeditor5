/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

import { insertImage, isImageAllowed } from './utils';

/**
 * @module image/image/insertimagecommand
 */

/**
 * Insert image command.
 *
 * The command is registered by the {@link module:image/image/imageediting~ImageEditing} plugin as `insertImage`
 * and it is also available via aliased `imageInsert` name.
 *
 * In order to insert an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and specify the image source:
 *
 *		editor.execute( 'insertImage', { source: 'http://url.to.the/image' } );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'insertImage', {
 *			source:  [
 *				'path/to/image.jpg',
 *				'path/to/other-image.jpg'
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class InsertImageCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isImageAllowed( this.editor.model );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {String|Array.<String>} options.source The image source or an array of image sources to insert.
	 */
	execute( options ) {
		const model = this.editor.model;

		for ( const src of toArray( options.source ) ) {
			insertImage( model, { src } );
		}
	}
}
