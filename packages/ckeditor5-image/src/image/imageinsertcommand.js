/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertImage, isImageAllowed } from './utils';

/**
 * @module image/image/imageinsertcommand
 */

/**
 * Insert image command.
 *
 * @extends module:core/command~Command
 */
export default class ImageInsertCommand extends Command {
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

		model.change( writer => {
			const sources = Array.isArray( options.source ) ? options.source : [ options.source ];

			for ( const src of sources ) {
				insertImage( writer, model, { src } );
			}
		} );
	}
}
