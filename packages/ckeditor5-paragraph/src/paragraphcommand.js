/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraphcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The paragraph command.
 *
 * @extends module:core/command~Command
 */
export default class ParagraphCommand extends Command {
	/**
	 * The value of the command. Indicates whether the selection start is placed in a paragraph.
	 *
	 * @readonly
	 * @observable
	 * @member {Boolean} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		const document = this.editor.document;
		const block = first( document.selection.getSelectedBlocks() );

		this.value = !!block && block.is( 'paragraph' );
		this.isEnabled = !!block && checkCanBecomeParagraph( block, document.schema );
	}

	/**
	 * Executes the command. All the blocks (see {@link module:engine/model/schema~Schema}) in the selection
	 * will be turned to paragraphs.
	 *
	 * @fires execute
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 * @param {module:engine/model/selection~Selection} [options.selection] The selection that the command should be applied to.
	 * By default, if not provided, the command is applied to the {@link module:engine/model/document~Document#selection}.
	 */
	execute( options = {} ) {
		const document = this.editor.document;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();
			const blocks = ( options.selection || document.selection ).getSelectedBlocks();

			for ( const block of blocks ) {
				if ( !block.is( 'paragraph' ) && checkCanBecomeParagraph( block, document.schema ) ) {
					batch.rename( block, 'paragraph' );
				}
			}
		} );
	}
}

// Checks whether the given block can be replaced by a paragraph.
//
// @private
// @param {module:engine/model/element~Element} block A block to be tested.
// @param {module:engine/model/schema~Schema} schema The schema of the document.
// @returns {Boolean}
function checkCanBecomeParagraph( block, schema ) {
	return schema.check( {
		name: 'paragraph',
		inside: Position.createBefore( block )
	} );
}
