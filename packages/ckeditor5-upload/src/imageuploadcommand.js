/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import FileRepository from './filerepository';
import { isImageType } from './utils';
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
	 * @param {module:engine/model/position~Position} [options.insertAt] Position of the inserted image.
	 * If the option won't be provided the position will be calculated by the {@link module:upload/imageuploadcommand~getInsertionPosition}.
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

		if ( !isImageType( file ) ) {
			return;
		}

		doc.enqueueChanges( () => {
			const insertAt = options.insertAt || getInsertionPosition( doc );

			// No position to insert.
			if ( !insertAt ) {
				return;
			}

			const imageElement = new ModelElement( 'image', {
				uploadId: fileRepository.createLoader( file ).id
			} );
			const documentFragment = new ModelDocumentFragment( [ imageElement ] );
			const range = new ModelRange( insertAt );
			const insertSelection = new ModelSelection();
			insertSelection.setRanges( [ range ] );

			editor.data.insertContent( documentFragment, insertSelection, batch );
			selection.setRanges( [ ModelRange.createOn( imageElement ) ] );
		} );
	}
}

/**
 * Returns correct image insertion position.
 *
 * @param {module:engine/model/document~Document} doc
 * @returns {module:engine/model/position~Position|undefined}
 */
function getInsertionPosition( doc ) {
	const selection = doc.selection;
	const selectedElement = selection.getSelectedElement();

	// If selected element is placed directly in root - return position after that element.
	if ( selectedElement && selectedElement.parent.is( 'rootElement' ) ) {
		return ModelPosition.createAfter( selectedElement );
	}

	const firstBlock = doc.selection.getSelectedBlocks().next().value;

	if ( firstBlock ) {
		const positionAfter = ModelPosition.createAfter( firstBlock );

		// If selection is at the end of the block - return position after the block.
		if ( selection.focus.isTouching( positionAfter ) ) {
			return positionAfter;
		}

		// Otherwise return position before the block.
		return ModelPosition.createBefore( firstBlock );
	}
}
