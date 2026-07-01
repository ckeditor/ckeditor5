/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojicommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import { type EmojiPicker } from './emojipicker.js';

/**
 * Command that shows the emoji user interface.
 */
export class EmojiCommand extends Command {
	constructor( editor: Editor ) {
		super( editor );

		const repository = editor.plugins.get( 'EmojiRepository' );

		this.listenTo( repository, 'change:isRepositoryReady', () => this.refresh() );
	}

	/**
	 * Updates the command's {@link #isEnabled} based on the current selection
	 * and whether the emoji repository has been loaded.
	 */
	public override refresh(): void {
		const editor = this.editor;
		const repository = editor.plugins.get( 'EmojiRepository' );

		const model = editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		this.isEnabled = !!repository.isRepositoryReady &&
			schema.checkChild( selection.getFirstPosition()!, '$text' );
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
