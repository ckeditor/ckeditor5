/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojiui
 */

import 'emoji-picker-element';
import { ButtonView } from 'ckeditor5/src/ui.js';
import { Plugin } from 'ckeditor5/src/core.js';

/**
 * The emoji UI plugin.
 *
 * Introduces the `'emoji'` dropdown.
 */
export default class EmojiUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'emoji', () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				label: t( 'Emoji' ),
				withText: true
			} );

			// Initialize the emoji picker element
			const emojiPicker = document.createElement( 'emoji-picker' );
			emojiPicker.style.display = 'none';
			document.body.appendChild( emojiPicker );

			// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
			editor.keystrokes.set( 'Esc', () => {
				console.log( 'esc' );
				emojiPicker.style.display = 'none';
			} );

			// Execute a callback function when the button is clicked.
			button.on( 'execute', () => {
				const rect = button!.element!.getBoundingClientRect();
				emojiPicker.style.position = 'absolute';
				emojiPicker.style.top = `${ rect.bottom }px`;
				emojiPicker.style.left = `${ rect.left }px`;
				emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';

				// const now = new Date();
				//
				// // Change the model using the model writer.
				// editor.model.change( writer => {
				// 	// Insert the text at the user's current position.
				// 	editor.model.insertContent( writer.createText( now.toString() ) );
				// } );
			} );

			emojiPicker.addEventListener( 'emoji-click', event => {
				const emoji = event.detail.unicode;
				editor.model.change( writer => {
					const insertPosition = editor.model.document.selection.getFirstPosition();
					writer.insertText( emoji!, insertPosition! );
				} );
				emojiPicker.style.display = 'none';
			} );

			return button;
		} );
	}
}
