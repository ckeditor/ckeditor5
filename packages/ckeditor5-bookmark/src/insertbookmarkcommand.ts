/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark/insertbookmarkcommand
 */

import type {
	DocumentSelection,
	Selection,
	Position,
	Schema,
	SchemaContextDefinition
} from 'ckeditor5/src/engine.js';
import { logWarning } from 'ckeditor5/src/utils.js';
import { Command } from 'ckeditor5/src/core.js';

import { isBookmarkIdValid } from './utils.js';

/**
 * The insert bookmark command.
 *
 * The command is registered by {@link module:bookmark/bookmarkediting~BookmarkEditing} as `'insertBookmark'`.
 *
 * To insert a bookmark element at place where is the current collapsed selection or where is the beginning of document selection,
 * execute the command passing the bookmark id as a parameter:
 *
 * ```ts
 * editor.execute( 'insertBookmark', { bookmarkId: 'foo_bar' } );
 * ```
 */
export default class InsertBookmarkCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const position = this._getPositionToInsertBookmark( selection );

		this.isEnabled = !!position;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.bookmarkId The value of the `bookmarkId` attribute.
	 */
	public override execute( options: { bookmarkId: string } ): void {
		if ( !options ) {
			return;
		}

		const { bookmarkId } = options;

		if ( !isBookmarkIdValid( bookmarkId ) ) {
			/**
			 * Insert bookmark command can be executed only with a valid name.
			 *
			 * A valid bookmark name must be a non-empty string and must not contain any spaces.
			 *
			 * @error insert-bookmark-command-executed-with-invalid-name
			 */
			logWarning( 'insert-bookmark-command-executed-with-invalid-name' );

			return;
		}

		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			let position = this._getPositionToInsertBookmark( selection )!;

			const isBookmarkAllowed = model.schema.checkChild( position, 'bookmark' );

			// If the position does not allow for `bookmark` but allows for a `paragraph`
			// then insert a `paragraph` then we will insert a `bookmark` inside.
			if ( !isBookmarkAllowed ) {
				const newPosition = editor.execute( 'insertParagraph', { position } ) as Position | null;

				if ( !newPosition ) {
					return;
				}

				position = newPosition;
			}

			const bookmarkElement = writer.createElement( 'bookmark', {
				...Object.fromEntries( selection.getAttributes() ),
				bookmarkId
			} );

			model.insertObject( bookmarkElement, position, null, { setSelection: 'on' } );
		} );
	}

	/**
	 * Returns the position where the bookmark can be inserted. And if it is not possible to insert a bookmark,
	 * check if it is possible to insert a paragraph.
	 */
	private _getPositionToInsertBookmark( selection: Selection | DocumentSelection ): Position | null {
		const model = this.editor.model;
		const schema = model.schema;

		const firstRange = selection.getFirstRange()!;
		const startPosition = firstRange.start;

		// Return position if it is allowed to insert bookmark or if it is allowed to insert paragraph.
		if ( isBookmarkAllowed( startPosition, schema ) ) {
			return startPosition;
		}

		for ( const { previousPosition, item } of firstRange ) {
			// When the table cell is selected (from the outside) we look for the first paragraph-like element inside.
			if (
				item.is( 'element' ) &&
				schema.checkChild( item, '$text' ) &&
				isBookmarkAllowed( item, schema )
			) {
				return model.createPositionAt( item, 0 );
			}

			if ( isBookmarkAllowed( previousPosition, schema ) ) {
				return previousPosition;
			}
		}

		return null;
	}
}

/**
 * Verify if the given position allows for bookmark insertion. Verify if auto-paragraphing could help.
 */
function isBookmarkAllowed( position: SchemaContextDefinition, schema: Schema ): boolean {
	if ( schema.checkChild( position, 'bookmark' ) ) {
		return true;
	}

	if ( !schema.checkChild( position, 'paragraph' ) ) {
		return false;
	}

	return schema.checkChild( 'paragraph', 'bookmark' );
}
