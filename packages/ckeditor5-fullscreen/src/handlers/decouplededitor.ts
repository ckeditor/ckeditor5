/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/decouplededitorhandler
 */

import type { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import type { AnnotationsUIs, Sidebar } from '@ckeditor/ckeditor5-comments';

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

		if ( this._editor.config.get( 'fullscreen.menuBar.isVisible' ) ) {
			this.moveToFullscreen( this._editor.ui.view.menuBarView.element!, 'menu-bar' );
		}

		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'AnnotationsUIs' ) ) {
			// Store the current state of the annotations UIs to restore when leaving fullscreen mode.
			const annotationsUIs = this._editor.plugins.get( 'AnnotationsUIs' ) as AnnotationsUIs;

			this.annotationsUIsData = new Map( annotationsUIs.uisData );

			// Switch to the wide sidebar.
			const sidebarPlugin = this._editor.plugins.get( 'Sidebar' ) as Sidebar;

			if ( !sidebarPlugin.container ) {
				sidebarPlugin.setContainer(
					this.getContainer().querySelector( '[data-ck-fullscreen="right-sidebar"]' ) as HTMLElement
				);
			}

			annotationsUIs.switchTo( 'wideSidebar' );

			this.moveToFullscreen( ( sidebarPlugin.container!.firstElementChild as HTMLElement ), 'right-sidebar' );
		}
	}
}
