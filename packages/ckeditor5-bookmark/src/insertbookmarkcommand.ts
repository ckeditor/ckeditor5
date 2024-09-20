/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/insertbookmarkcommand
 */

import type { DocumentSelection, Selection, Position } from 'ckeditor5/src/engine.js';
import { Command } from 'ckeditor5/src/core.js';

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
		const doesPositionThatBookmarkCanBeInsertedExists = !!this._getPositionToInsertBookmark( selection );

		this.isEnabled = doesPositionThatBookmarkCanBeInsertedExists;
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

		if ( !bookmarkId || typeof bookmarkId !== 'string' ) {
			return;
		}

		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			const position = this._getPositionToInsertBookmark( selection );

			if ( !position ) {
				return;
			}

			const isBookmarkAllowedBySchema = model.schema.checkChild( position, 'bookmark' );

			// If the position allow for `bookmark` then insert it.
			if ( isBookmarkAllowedBySchema ) {
				writer.setSelection( position );

				model.insertObject( writer.createElement( 'bookmark', { bookmarkId } ) );

				return;
			}

			const isParagraphAllowedBySchema = model.schema.checkChild( position, 'paragraph' );

			// If the position does not allow for `bookmark` but allows for a `paragraph`
			// then insert a `paragraph` with a `bookmark` inside.
			if ( isParagraphAllowedBySchema ) {
				editor.execute( 'insertParagraph', { position } );

				model.insertObject( writer.createElement( 'bookmark', { bookmarkId } ) );
			}
		} );
	}

	/**
	 * Returns the position where the bookmark can be inserted. And if it is not possible to insert a bookmark,
	 * check if it is possible to insert a paragraph.
	 */
	private _getPositionToInsertBookmark( selection: Selection | DocumentSelection ): Position | null {
		const model = this.editor.model;
		const schema = model.schema;

		const startPosition = selection.getFirstPosition()!;

		const isBookmarkAllowedBySchema = schema.checkChild( startPosition, 'bookmark' );
		const isParagraphAllowedBySchema = model.schema.checkChild( startPosition, 'paragraph' );

		// Return position if it is allowed to insert bookmark or if it is allowed to insert paragraph.
		if ( isBookmarkAllowedBySchema || isParagraphAllowedBySchema ) {
			return startPosition;
		}

		const firstRange = selection.getFirstRange()!;

		for ( const item of firstRange.getItems() ) {
			if ( schema.checkChild( item, 'bookmark' ) ) {
				return model.createPositionAt( item, 0 );
			}

			if ( schema.checkChild( item, 'paragraph' ) ) {
				return model.createPositionAt( item, 0 );
			}
		}

		return null;
	}
}
