/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojicommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type EmojiPicker from './emojipicker.js';

/**
 * Command that shows the emoji user interface.
 */
export default class EmojiCommand extends Command {
	/**
	 * Updates the command's {@link #isEnabled} based on the current selection.
	 */
	public override refresh(): void {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		this.isEnabled = schema.checkChild( selection.getFirstPosition()!, '$text' );
	}

	/**
	 * Opens emoji user interface for the current document selection.
	 *
	 * @fires execute
	 * @param [searchValue=''] A default query used to filer the grid when opening the UI.
	 */
	public override execute( searchValue: string = '' ): void {
		const emojiPickerPlugin: EmojiPicker = this.editor.plugins.get( 'EmojiPicker' );

		emojiPickerPlugin.showUI( searchValue );
	}
}
