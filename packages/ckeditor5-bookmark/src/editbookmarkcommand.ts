/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/editbookmarkcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type { Selection, DocumentSelection } from 'ckeditor5/src/engine.js';

/**
 * The edit bookmark command. It is used by the {@link module:bookmark/bookmark~Bookmark bookmark plugin}.
 */
export default class EditBookmarkCommand extends Command {
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

		this.isEnabled = !!getSelectedBookmark( selection );
	}

	/**
	 * TODO: Add description.
	 *
	 * @param bookmarkId The new value of the `'bookmarkId'` attribute.
	 */
	public override execute( bookmarkId: string ): void {
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
