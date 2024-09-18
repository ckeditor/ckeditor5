/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/insertbookmarkcommand
 */

import type { DocumentSelection, Item, Element, Selection } from 'ckeditor5/src/engine.js';
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
		const startPosition = selection.isCollapsed ? selection.anchor! : selection.getFirstPosition()!;

		const isAllowedElementInSelection = !!this._getAllowedElementBasedOnSelection( selection );
		const isAllowedBookmarkBySchema = model.schema.checkChild( startPosition, 'bookmark' );
		const isAllowedPAragraphBySchema = model.schema.checkChild( startPosition, 'paragraph' );

		const isAllowed = isAllowedBookmarkBySchema || isAllowedElementInSelection || isAllowedPAragraphBySchema;

		this.isEnabled = isAllowed;
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
			const startPosition = selection.isCollapsed ? selection.anchor! : selection.getFirstPosition()!;
			const isAllowedBookmarkBySchema = model.schema.checkChild( startPosition, 'bookmark' );

			// If it is allowed to insert bookmark by schema than insert it.
			if ( isAllowedBookmarkBySchema ) {
				writer.setSelection( startPosition );

				return model.insertObject( writer.createElement( 'bookmark', { bookmarkId } ) );
			} else {
				const selectedElement = selection.getSelectedElement();

				// If is selected single element and if it's a block element
				// check if paragraph can be inserted before it and add bookmark inside of this paragraph.
				if ( selectedElement && model.schema.isBlock( selectedElement ) ) {
					editor.execute( 'insertParagraph', {
						position: editor.model.createPositionAt( selectedElement, 'before' )
					} );

					return model.insertObject( writer.createElement( 'bookmark', { bookmarkId } ) );
				} else {
					// If paragraph is not allowed by the schema then scan the selection ranges to find the first position
					// for bookmark insertion (for example multiple table cells selected)
					const allowedElement = this._getAllowedElementBasedOnSelection( selection ) as Element | null;

					if ( allowedElement && allowedElement.childCount ) {
						const firstChild = allowedElement.getChild( 0 )!;

						// When first child is a paragraph then insert bookmark at the first place inside of it.
						if ( firstChild.is( 'element', 'paragraph' ) ) {
							writer.setSelection( firstChild, 'before' );

							return writer.insertElement( 'bookmark', { bookmarkId }, firstChild );
						}

						// If first child is not a paragraph then insert paragraph before it and add bookmark inside of this paragraph.
						const positionAtAllowedElement = model.createPositionAt( allowedElement, 0 );

						editor.execute( 'insertParagraph', {
							position: positionAtAllowedElement
						} );

						model.insertObject( writer.createElement( 'bookmark', { bookmarkId } ) );
					}
				}
			}
		} );
	}

	/**
	 * Returns the first element that accepts adding a `paragraph` on it.
	 * @param selection Current selection.
	 */
	private _getAllowedElementBasedOnSelection( selection: Selection | DocumentSelection ): Item | null {
		const schema = this.editor.model.schema;

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkChild( item, 'paragraph' ) ) {
					return item;
				}
			}
		}

		return null;
	}
}
