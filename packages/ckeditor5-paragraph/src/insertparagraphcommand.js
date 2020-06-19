/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paragraph/insertparagraphcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The insert paragraph command. It inserts a new paragraph at a specific
 * {@link module:engine/model/position~Position document position}.
 *
 *		// Insert a new paragraph before an element in the document.
 *		editor.execute( 'insertParagraph', {
 *			position: editor.model.createPositionBefore( element )
 *		} );
 *
 * If a paragraph is disallowed in the context of the specific position, the command
 * will attempt to split position ancestors to find a place where it is possible
 * to insert a paragraph.
 *
 * **Note**: This command moves the selection to the inserted paragraph.
 *
 * @extends module:core/command~Command
 */
export default class InsertParagraphCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * @param {Object} options Options for the executed command.
	 * @param {module:engine/model/position~Position} options.position The model position at which
	 * the new paragraph will be inserted.
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		let position = options.position;

		model.change( writer => {
			const paragraph = writer.createElement( 'paragraph' );

			if ( !model.schema.checkChild( position.parent, paragraph ) ) {
				const allowedParent = model.schema.findAllowedParent( position, paragraph );

				// It could be there's no ancestor limit that would allow paragraph.
				// In theory, "paragraph" could be disallowed even in the "$root".
				if ( !allowedParent ) {
					return;
				}

				position = writer.split( position, allowedParent ).position;
			}

			model.insertContent( paragraph, position );

			writer.setSelection( paragraph, 'in' );
		} );
	}
}
