/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/classiceditorhandler
 */

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
	}

	/**
	 * Moves the editor UI elements to the fullscreen mode.
	 */
	public override enable(): void {
		this.moveToFullscreen( this._editor.ui.getEditableElement()!, 'editor' );
		this.moveToFullscreen( this._editor.ui.view.toolbar.element!, 'toolbar' );

		// In classic editor, the `dir` attribute is set on the whole top container (containing menu bar and toolbar)
		// and it affects the styling in both menu bar and toolbar (adding the side padding to the elements).
		// We need to reapply the attribute value manually.
		// Decupled editor doesn't have this issue because there is no top container so `dir` is set on each element separately.
		this._editor.ui.view.toolbar.element!.setAttribute( 'dir', this._editor.ui.view.element!.getAttribute( 'dir' )! );

		if ( this._editor.ui.view.menuBarView ) {
			this.moveToFullscreen( this._editor.ui.view.menuBarView.element!, 'menu-bar' );

			// See the comment above for toolbar.
			this._editor.ui.view.menuBarView.element!.setAttribute( 'dir', this._editor.ui.view.element!.getAttribute( 'dir' )! );
		}
	}

	/**
	 * Restores the editor UI elements to their original positions.
	 */
	public override disable(): void {
		this._editor.ui.view.toolbar.element!.removeAttribute( 'dir' );

		if ( this._editor.ui.view.menuBarView ) {
			this._editor.ui.view.menuBarView.element!.removeAttribute( 'dir' );
		}

		this.returnMovedElements();
	}
}
