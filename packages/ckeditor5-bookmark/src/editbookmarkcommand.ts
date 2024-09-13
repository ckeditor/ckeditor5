/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/editbookmarkcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type { DocumentSelection } from 'ckeditor5/src/engine.js';

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
		const selectedBookmarkElement = getSelectedBookmarkModelWidget( selection );

		// // A check for any integration that allows linking elements (e.g. `LinkImage`).
		// // Currently the selection reads attributes from text nodes only. See #7429 and #7465.
		// if ( selectedElement ) {
		// 	this.isEnabled = model.schema.checkAttribute( selectedElement, 'bookmarkId' );
		// } else {
		// 	this.isEnabled = model.schema.checkAttributeInSelection( selection, 'bookmarkId' );
		// }
	}

	/**
	 * TODO: Add description.
	 *
	 * @param bookmarkId The new value of the `'bookmarkId'` attribute.
	 */
	public override execute( bookmarkId: string ): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedBookmarkElement = getSelectedBookmarkModelWidget( selection );

		if ( selectedBookmarkElement ) {
			model.change( writer => {
				writer.setAttribute( 'bookmarkId', bookmarkId, selectedBookmarkElement );
			} );
		}
	}
}

/**
 * Returns the selected `bookmark` element in the model, if any.
 */
function getSelectedBookmarkModelWidget( selection: DocumentSelection ): Element | null {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'bookmark' ) ) {
		return selectedElement;
	}

	return null;
}
