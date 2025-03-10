/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreenediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import FullscreenCommand from './fullscreencommand.js';

/**
 * A plugin that registers the fullscreen mode command.
 */
export default class FullscreenEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullscreenEditing' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'fullscreen.menuBar.isVisible', true );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.commands.add( 'fullscreen', new FullscreenCommand( this.editor ) );

		const t = this.editor.locale.t;

		// Set the Ctrl+Shift+F keystroke.
		this.editor.keystrokes.set( 'Ctrl+Shift+F', 'fullscreen' );

		// Add the information about the keystroke to the accessibility database.
		this.editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Toggle fullscreen mode' ),
					keystroke: 'CTRL+SHIFT+F'
				}
			],
			categoryId: 'navigation'
		} );
	}
}
