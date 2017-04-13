/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import FileRepository from './filerepository';
import { isImageType } from './utils';
import Command from '@ckeditor/ckeditor5-core/src/command/command';

/**
 * @module upload/imageuploadcommand
 */

/**
 * Image upload command.
 *
 * @extends module:core/command/command~Command
 */
export default class ImageUploadCommand extends Command {
	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} options Options for executed command.
	 * @param {File} options.file Image file to upload.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	_doExecute( options ) {
		const editor = this.editor;
		const doc = editor.document;
		const batch = options.batch || doc.batch();
		const file = options.file;
		const fileRepository = editor.plugins.get( FileRepository );

		if ( !isImageType( file ) ) {
			return;
		}

		doc.enqueueChanges( () => {
			const imageElement = new ModelElement( 'image', {
				uploadId: fileRepository.createLoader( file ).id
			} );
			const documentFragment = new ModelDocumentFragment( [ imageElement ] );

			const firstBlock = doc.selection.getSelectedBlocks().next().value;
			const range = ModelRange.createFromParentsAndOffsets( firstBlock, 0, firstBlock, 0 );
			const insertSelection = new ModelSelection();
			insertSelection.setRanges( [ range ] );

			editor.data.insertContent( documentFragment, insertSelection, batch );
		} );
	}
}
