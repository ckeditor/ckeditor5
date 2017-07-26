/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import FileRepository from './filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * @module upload/imageuploadcommand
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
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	execute( options ) {
		const editor = this.editor;
		const doc = editor.document;
		const batch = options.batch || doc.batch();
		const file = options.file;
		const selection = doc.selection;
		const fileRepository = editor.plugins.get( FileRepository );

		doc.enqueueChanges( () => {
			const imageElement = new ModelElement( 'image', {
				uploadId: fileRepository.createLoader( file ).id
			} );

			let insertAtSelection;

			if ( options.insertAt ) {
				insertAtSelection = new ModelSelection( [ new ModelRange( options.insertAt ) ] );
			} else {
				insertAtSelection = doc.selection;
			}

			editor.data.insertContent( imageElement, insertAtSelection, batch );

			// Inserting an image might've failed due to schema regulations.
			if ( imageElement.parent ) {
				selection.setRanges( [ ModelRange.createOn( imageElement ) ] );
			}
		} );
	}
}

// Returns correct image insertion position.
//
// @param {module:engine/model/document~Document} doc
// @returns {module:engine/model/position~Position|undefined}

