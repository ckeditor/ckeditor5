/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

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
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const position = selection.getFirstPosition();
		let parent = position.parent;

		if ( parent != parent.root ) {
			parent = parent.parent;
		}

		this.isEnabled = schema.checkChild( parent, 'image' );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File|Array.<File>} options.files The image file or an array of image files to upload.
	 * @param {module:engine/model/position~Position} [options.insertAt] The position at which the images should be inserted.
	 * If the position is not specified, the image will be inserted into the current selection.
	 * Note: You can use the {@link module:widget/utils~findOptimalInsertionPosition} function
	 * to calculate (e.g. based on the current selection) a position which is more optimal from the UX perspective.
	 */
	execute( options ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const filesToUpload = Array.isArray( options.files ) ? options.files : [ options.files ];

			// Reverse the order of items as the editor will place in reverse when using the same position.
			for ( const file of filesToUpload.reverse() ) {
				uploadImage( writer, editor, file, options.insertAt );
			}
		} );
	}
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:core/editor/editor~Editor} editor
// @param {File} file
// @param {module:engine/model/position~Position} insertAt
function uploadImage( writer, editor, file, insertAt ) {
	const doc = editor.model.document;
	const fileRepository = editor.plugins.get( FileRepository );

	const loader = fileRepository.createLoader( file );

	// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
	if ( !loader ) {
		return;
	}

	const imageElement = writer.createElement( 'image', {
		uploadId: loader.id
	} );

	let insertAtSelection;

	if ( insertAt ) {
		insertAtSelection = new ModelSelection( [ new ModelRange( insertAt ) ] );
	} else {
		insertAtSelection = doc.selection;
	}

	editor.model.insertContent( imageElement, insertAtSelection );

	// Inserting an image might've failed due to schema regulations.
	if ( imageElement.parent ) {
		writer.setSelection( imageElement, 'on' );
	}
}
