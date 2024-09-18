/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/updatebookmarkcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type { Selection, DocumentSelection } from 'ckeditor5/src/engine.js';

/**
 * The update bookmark command.
 *
 * The command is registered by {@link module:bookmark/bookmarkediting~BookmarkEditing} as `'updateBookmark'`.
 *
 * To update the `bookmarkId` of current selected bookmark element, execute the command passing the bookmark id as a parameter:
 *
 * ```ts
 * editor.execute( 'updateBookmark', { bookmarkId: 'newId' } );
 * ```
 */
export default class UpdateBookmarkCommand extends Command {
	/**
	 * The value of the `'bookmarkId'` attribute.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: string | undefined;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedBookmark = getSelectedBookmark( selection );

		this.isEnabled = !!selectedBookmark;
		this.value = selectedBookmark ? selectedBookmark.getAttribute( 'bookmarkId' ) as string : undefined;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.bookmarkId The new value of the `bookmarkId` attribute to set.
	 */
	public override execute( options: { bookmarkId: string } ): void {
		if ( !options ) {
			return;
		}

		const { bookmarkId } = options;

		if ( !bookmarkId || typeof bookmarkId !== 'string' ) {
			return;
		}

		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedBookmark = getSelectedBookmark( selection );

		if ( selectedBookmark ) {
			model.change( writer => {
				writer.setAttribute( 'bookmarkId', bookmarkId, selectedBookmark );
			} );
		}
	}
}

/**
 * Returns the selected `bookmark` element in the model, if any.
 */
function getSelectedBookmark( selection: Selection | DocumentSelection ) {
	const element = selection.getSelectedElement();

	if ( !!element && element.is( 'element', 'bookmark' ) ) {
		return element;
	}

	return null;
}
