/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paragraph/insertparagraphcommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import type { Element, Position } from '@ckeditor/ckeditor5-engine';

/**
 * The insert paragraph command. It inserts a new paragraph at a specific
 * {@link module:engine/model/position~Position document position}.
 *
 * ```ts
 * // Insert a new paragraph before an element in the document.
 * editor.execute( 'insertParagraph', {
 *   position: editor.model.createPositionBefore( element )
 * } );
 * ```
 *
 * If a paragraph is disallowed in the context of the specific position, the command
 * will attempt to split position ancestors to find a place where it is possible
 * to insert a paragraph.
 *
 * **Note**: This command moves the selection to the inserted paragraph.
 */
export default class InsertParagraphCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * @param options Options for the executed command.
	 * @param options.position The model position at which the new paragraph will be inserted.
	 * @param options.attributes Attributes keys and values to set on a inserted paragraph.
	 * @fires execute
	 */
	public override execute( options: {
		position: Position;
		attributes: Record<string, unknown>;
	} ): void {
		const model = this.editor.model;
		const attributes = options.attributes;

		let position = options.position;

		model.change( writer => {
			const paragraph = writer.createElement( 'paragraph' );

			if ( attributes ) {
				model.schema.setAllowedAttributes( paragraph, attributes, writer );
			}

			if ( !model.schema.checkChild( position.parent as Element, paragraph ) ) {
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
