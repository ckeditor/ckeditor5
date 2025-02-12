/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/decouplededitorhandler
 */

import type { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { PresenceListUI } from '@ckeditor/ckeditor5-real-time-collaboration';

import AbstractEditorHandler from './abstracteditor.js';

/**
 * The decoupled editor fullscreen mode handler.
 */
export default class DecoupledEditorHandler extends AbstractEditorHandler {
	/**
	 * An editor instance.
	 */
	protected override readonly _editor: DecoupledEditor;

	/**
	 * @inheritDoc
	 */
	constructor( editor: DecoupledEditor ) {
		super();

		this._editor = editor;

		this._editor.on( 'destroy', () => {
			this.disable();
		} );
	}

	/**
	 * Moves the editor UI elements to the fullscreen mode.
	 */
	public override enable(): void {
		this.moveToFullscreen( this._editor.ui.getEditableElement()!, 'editor' );
		this.moveToFullscreen( this._editor.ui.view.toolbar.element!, 'toolbar' );

		if ( this._editor.plugins.has( 'PresenceListUI' ) ) {
			const presenceListUI: PresenceListUI = this._editor.plugins.get( PresenceListUI );

			this.moveToFullscreen( presenceListUI.view.element!, 'presence-list' );
		}

		if ( this._editor.config.get( 'fullscreen.menuBar.isVisible' ) ) {
			this.moveToFullscreen( this._editor.ui.view.menuBarView.element!, 'menu-bar' );
		}
	}

	/**
	 * Restores the editor UI elements to their original positions.
	 */
	public override disable(): void {
		this.returnMovedElements();
	}
}
