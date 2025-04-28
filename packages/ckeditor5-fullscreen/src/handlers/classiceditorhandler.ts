/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/classiceditorhandler
 */

import { MenuBarView } from 'ckeditor5/src/ui.js';
import type { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import AbstractEditorHandler from './abstracteditorhandler.js';

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
		super( editor );

		this._editor = editor;
	}

	/**
	 * A function that moves the editor UI elements to the fullscreen mode.
	 */
	public override defaultOnEnter(): HTMLElement {
		const editorUI = this._editor.ui;
		const editorUIView = editorUI.view;

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore next -- @preserve */
		if ( this._editor.plugins.has( 'Pagination' ) && ( this._editor.plugins.get( 'Pagination' ) as any ).isEnabled ) {
			this.moveToFullscreen(
				editorUI.getEditableElement()!.parentElement!.querySelector( '.ck-pagination-view' )!, 'pagination-view'
			);
		}

		this.moveToFullscreen( editorUI.getEditableElement()!, 'editable' );
		this.moveToFullscreen( editorUIView.toolbar.element!, 'toolbar' );

		editorUIView.toolbar.switchBehavior(
			this._editor.config.get( 'fullscreen.toolbar.shouldNotGroupWhenFull' ) === true ? 'static' : 'dynamic'
		);

		// In classic editor, the `dir` attribute is set on the top-level container and it affects the styling
		// in both menu bar and toolbar (adding the side padding to the elements).
		// Since we don't move the whole container but only parts, we need to reapply the attribute value manually.
		// Decupled editor doesn't have this issue because there is no top-level container,
		// so `dir` attribute is set on each component separately.
		this.getWrapper().setAttribute( 'dir', editorUIView.element!.getAttribute( 'dir' )! );

		// The `ck-rounded-corners` class is added to the wrapper element to ensure that the corners in menu bar, toolbar etc are rounded
		// when the editor is in fullscreen mode.
		// Decupled editor doesn't have this issue because there is no top-level container,
		// so `ck-rounded-corners` class is set on each component separately.
		this.getWrapper().classList.add( 'ck-rounded-corners' );

		if ( this._editor.config.get( 'fullscreen.menuBar.isVisible' ) ) {
			if ( !editorUIView.menuBarView ) {
				editorUIView.menuBarView = new MenuBarView( this._editor.locale );
				editorUIView.menuBarView.render();
				editorUI.initMenuBar( editorUIView.menuBarView );
			}

			this.moveToFullscreen( editorUIView.menuBarView.element!, 'menu-bar' );
		}

		return this.getWrapper();
	}
}
