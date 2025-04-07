/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreenediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { env } from 'ckeditor5/src/utils.js';

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

		// By default, toolbar should behave the same way in fullscreen mode as in normal mode.
		// This means that the toolbar buttons should be grouped when the toolbar is full.
		editor.config.define( 'fullscreen.toolbar.shouldNotGroupWhenFull', editor.config.get( 'toolbar.shouldNotGroupWhenFull' ) === true );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.commands.add( 'toggleFullscreen', new FullscreenCommand( this.editor ) );

		const t = this.editor.locale.t;

		// Set the Ctrl+Shift+F keystroke.
		this.editor.keystrokes.set( 'Ctrl+Shift+F', ( evt, cancel ) => {
			this.editor.execute( 'toggleFullscreen' );

			// On non-Chromium browsers, the editor view and toolbar are not blurred properly after moving the editable,
			// even though the `document.activeElement` is changed. Hence we need to blur them manually.
			// Fixes https://github.com/ckeditor/ckeditor5/issues/18250 and https://github.com/ckeditor/ckeditor5/issues/18247.
			if ( !env.isBlink ) {
				this.editor.editing.view.document.isFocused = false;
				this.editor.ui.view.toolbar!.focusTracker.focusedElement = null;
			}

			// The order of scroll and focus is not important here.
			this.editor.editing.view.scrollToTheSelection();
			this.editor.editing.view.focus();

			cancel();
		} );

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
