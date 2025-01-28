/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paragraph/insertparagraphcommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { Element, Position, Writer } from '@ckeditor/ckeditor5-engine';

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
	public constructor( editor: Editor ) {
		super( editor );

		// Since this command passes position in execution block instead of selection, it should be checked directly.
		this._isEnabledBasedOnSelection = false;
	}

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
		attributes?: Record<string, unknown>;
	} ): Position | null {
		const model = this.editor.model;
		const attributes = options.attributes;

		let position: Position | null = options.position;

		// Don't execute command if position is in non-editable place.
		if ( !model.canEditAt( position ) ) {
			return null;
		}

		return model.change( writer => {
			position = this._findPositionToInsertParagraph( position!, writer );

			if ( !position ) {
				return null;
			}

			const paragraph = writer.createElement( 'paragraph' );

			if ( attributes ) {
				model.schema.setAllowedAttributes( paragraph, attributes, writer );
			}

			model.insertContent( paragraph, position );
			writer.setSelection( paragraph, 'in' );

			return writer.createPositionAt( paragraph, 0 );
		} );
	}

	/**
	 * Returns the best position to insert a new paragraph.
	 */
	private _findPositionToInsertParagraph( position: Position, writer: Writer ): Position | null {
		const model = this.editor.model;

		if ( model.schema.checkChild( position, 'paragraph' ) ) {
			return position;
		}

		const allowedParent = model.schema.findAllowedParent( position, 'paragraph' );

		// It could be there's no ancestor limit that would allow paragraph.
		// In theory, "paragraph" could be disallowed even in the "$root".
		if ( !allowedParent ) {
			return null;
		}

		const positionParent = position.parent as Element;
		const isTextAllowed = model.schema.checkChild( positionParent, '$text' );

		// At empty $block or at the end of $block.
		// <paragraph>[]</paragraph> ---> <paragraph></paragraph><paragraph>[]</paragraph>
		// <paragraph>foo[]</paragraph> ---> <paragraph>foo</paragraph><paragraph>[]</paragraph>
		if ( positionParent.isEmpty || isTextAllowed && position.isAtEnd ) {
			return model.createPositionAfter( positionParent );
		}

		// At the start of $block with text.
		// <paragraph>[]foo</paragraph> ---> <paragraph>[]</paragraph><paragraph>foo</paragraph>
		if ( !positionParent.isEmpty && isTextAllowed && position.isAtStart ) {
			return model.createPositionBefore( positionParent );
		}

		return writer.split( position, allowedParent ).position;
	}
}
