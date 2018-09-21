/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

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

		this.isEnabled = isImageAllowedInParent( selection, schema ) && checkSelectionWithImage( selection );
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

			for ( const file of filesToUpload ) {
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
		insertAtSelection = findOptimalInsertionPosition( doc.selection );
	}

	editor.model.insertContent( imageElement, insertAtSelection );

	// Inserting an image might've failed due to schema regulations.
	if ( imageElement.parent ) {
		writer.setSelection( imageElement, 'on' );
	}
}

// Checks if image is allowed by schema in optimal insertion parent.
function isImageAllowedInParent( selection, schema ) {
	const parent = getInsertImageParent( selection );

	return schema.checkChild( parent, 'image' );
}

// Additional check for when the command should be disabled:
// - selection is on image
// - selection is inside image (image caption)
function checkSelectionWithImage( selection ) {
	const selectedElement = selection.getSelectedElement();

	const isSelectionOnImage = !!selectedElement && selectedElement.is( 'image' );
	const isSelectionInImage = !![ ...selection.focus.parent.getAncestors() ].find( ancestor => ancestor.name == 'image' );

	return !isSelectionOnImage && !isSelectionInImage;
}

// Returns a node that will be used to insert image with `model.insertContent` to check if image can be placed there.
function getInsertImageParent( selection ) {
	const insertAt = findOptimalInsertionPosition( selection );

	let parent = insertAt.parent;

	if ( !parent.is( '$root' ) ) {
		parent = parent.parent;
	}

	return parent;
}
