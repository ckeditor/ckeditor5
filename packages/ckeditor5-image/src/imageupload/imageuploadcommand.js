/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * @module image/imageupload/imageuploadcommand
 */

/**
 * Image upload command.
 *
 * @extends module:core/command~Command
 */
export default class ImageUploadCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for executed command.
	 * @param {File} options.file Image file to upload.
	 * @param {module:engine/model/position~Position} [options.insertAt] Position at which the image should be inserted.
	 * If the position is not specified the image will be inserted into the current selection.
	 * Note: You can use the {@link module:upload/utils~findOptimalInsertionPosition} function to calculate
	 * (e.g. based on the current selection) a position which is more optimal from UX perspective.
	 */
	execute( options ) {
		const editor = this.editor;
		const doc = editor.model.document;
		const file = options.file;
		const fileRepository = editor.plugins.get( FileRepository );

		editor.model.change( writer => {
			const loader = fileRepository.createLoader( file );

			// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
			if ( !loader ) {
				return;
			}

			const imageElement = new ModelElement( 'image', {
				uploadId: loader.id
			} );

			let insertAtSelection;

			if ( options.insertAt ) {
				insertAtSelection = new ModelSelection( [ new ModelRange( options.insertAt ) ] );
			} else {
				insertAtSelection = doc.selection;
			}

			editor.model.insertContent( imageElement, insertAtSelection );

			// Inserting an image might've failed due to schema regulations.
			if ( imageElement.parent ) {
				writer.setSelection( ModelRange.createOn( imageElement ) );
			}
		} );
	}
}
