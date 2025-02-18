/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/classiceditorhandler
 */

import { MenuBarView } from 'ckeditor5/src/ui.js';
import type { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import AbstractEditorHandler from './abstracteditor.js';

/**
 * The classic editor fullscreen mode handler.
 */
export default class ClassicEditorHandler extends AbstractEditorHandler {
	/**
	 * An editor instance.
	 */
	protected override readonly _editor: ClassicEditor;

	/**
	 * @inheritDoc
	 */
	constructor( editor: ClassicEditor ) {
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
		const editorUI = this._editor.ui;
		const editorUIView = editorUI.view;

		this.moveToFullscreen( editorUI.getEditableElement()!, 'editor' );
		this.moveToFullscreen( editorUIView.toolbar.element!, 'toolbar' );

		this.generatePresenceListElement();
		this.generateDocumentOutlineElement();

		// In classic editor, the `dir` attribute is set on the top-level container and it affects the styling
		// in both menu bar and toolbar (adding the side padding to the elements).
		// Since we don't move the whole container but only parts, we need to reapply the attribute value manually.
		// Decupled editor doesn't have this issue because there is no top-level container, so `dir` is set on each component separately.
		this.getContainer().setAttribute( 'dir', editorUIView.element!.getAttribute( 'dir' )! );

		if ( !this._editor.config.get( 'fullscreen.menuBar.isVisible' ) ) {
			return;
		}

		if ( !editorUIView.menuBarView ) {
			editorUIView.menuBarView = new MenuBarView( this._editor.locale );
			editorUIView.menuBarView.render();
			editorUI.initMenuBar( editorUIView.menuBarView );
		}

		this.moveToFullscreen( editorUIView.menuBarView.element!, 'menu-bar' );
	}

	/**
	 * Restores the editor UI elements to their original positions.
	 */
	public override disable(): void {
		this.returnMovedElements();
	}
}
