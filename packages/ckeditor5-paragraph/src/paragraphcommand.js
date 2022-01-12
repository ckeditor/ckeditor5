/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paragraph/paragraphcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
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
		const model = this.editor.model;
		const document = model.document;
		const block = first( document.selection.getSelectedBlocks() );

		this.value = !!block && block.is( 'element', 'paragraph' );
		this.isEnabled = !!block && checkCanBecomeParagraph( block, model.schema );
	}

	/**
	 * Executes the command. All the blocks (see {@link module:engine/model/schema~Schema}) in the selection
	 * will be turned to paragraphs.
	 *
	 * @fires execute
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} [options.selection]
	 * The selection that the command should be applied to.
	 * By default, if not provided, the command is applied to the {@link module:engine/model/document~Document#selection}.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;

		model.change( writer => {
			const blocks = ( options.selection || document.selection ).getSelectedBlocks();

			for ( const block of blocks ) {
				if ( !block.is( 'element', 'paragraph' ) && checkCanBecomeParagraph( block, model.schema ) ) {
					writer.rename( block, 'paragraph' );
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
	return schema.checkChild( block.parent, 'paragraph' ) && !schema.isObject( block );
}
