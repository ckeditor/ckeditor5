/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paragraph/insertparagraphcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The insert paragraph command. It insert a new paragraph next to the provided model element.
 *
 *		// Insert a new paragraph before the first element in the document root.
 *		editor.execute( 'insertParagraph', {
 *			element: editor.model.document.getRoot().getChild( 0 ),
 *			position: 'before'
 *		} );
 *
 * **Note**: This command moves the selection to the inserted paragraph.
 *
 * @extends module:core/command~Command
 */
export default class InsertParagraphCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} options Options for the executed command.
	 * @param {module:engine/model/element~Element} options.element The model element next to which
	 * the new paragraph will be inserted.
	 * @param {'before'|'after'} options.position The position relative to the passed `element` where
	 * the new paragraph will be inserted.
	 * @fires execute
	 */
	execute( options = {} ) {
		const editor = this.editor;
		const model = this.editor.model;
		let modelPosition;

		if ( options.position === 'before' ) {
			modelPosition = model.createPositionBefore( options.element );
		} else {
			modelPosition = model.createPositionAfter( options.element );
		}

		if ( !model.schema.checkChild( modelPosition, 'paragraph' ) ) {
			return;
		}

		editor.model.change( writer => {
			const paragraph = writer.createElement( 'paragraph' );
			const selection = writer.createSelection( paragraph, 'in' );

			editor.model.insertContent( paragraph, modelPosition );

			writer.setSelection( selection );
		} );
	}
}
