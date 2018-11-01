/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

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

		this.isEnabled = isImageAllowedInParent( selection, schema, model ) && checkSelectionWithObject( selection, schema );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File|Array.<File>} options.files The image file or an array of image files to upload.
	 */
	execute( options ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const filesToUpload = Array.isArray( options.files ) ? options.files : [ options.files ];

			for ( const file of filesToUpload ) {
				uploadImage( writer, editor, file );
			}
		} );
	}
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:core/editor/editor~Editor} editor
// @param {File} file
function uploadImage( writer, editor, file ) {
	const model = editor.model;
	const doc = model.document;
	const fileRepository = editor.plugins.get( FileRepository );

	const loader = fileRepository.createLoader( file );

	// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
	if ( !loader ) {
		return;
	}

	const imageElement = writer.createElement( 'image', { uploadId: loader.id } );

	const insertAtSelection = findOptimalInsertionPosition( doc.selection, model );

	model.insertContent( imageElement, insertAtSelection );

	// Inserting an image might've failed due to schema regulations.
	if ( imageElement.parent ) {
		writer.setSelection( imageElement, 'on' );
	}
}

// Checks if image is allowed by schema in optimal insertion parent.
function isImageAllowedInParent( selection, schema, model ) {
	const parent = getInsertImageParent( selection, model );

	return schema.checkChild( parent, 'image' );
}

// Additional check for when the command should be disabled:
// - selection is on object
// - selection is inside object
function checkSelectionWithObject( selection, schema ) {
	const selectedElement = selection.getSelectedElement();

	const isSelectionOnObject = !!selectedElement && schema.isObject( selectedElement );
	const isSelectionInObject = !![ ...selection.focus.getAncestors() ].find( ancestor => schema.isObject( ancestor ) );

	return !isSelectionOnObject && !isSelectionInObject;
}

// Returns a node that will be used to insert image with `model.insertContent` to check if image can be placed there.
function getInsertImageParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	let parent = insertAt.parent;

	if ( !parent.is( '$root' ) ) {
		parent = parent.parent;
	}

	return parent;
}
