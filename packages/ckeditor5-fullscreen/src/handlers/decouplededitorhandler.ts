/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/decouplededitorhandler
 */

import type { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';

import { FullscreenAbstractEditorHandler } from './abstracteditorhandler.js';
import { getParentNode } from '@ckeditor/ckeditor5-utils';

/**
 * The decoupled editor fullscreen mode handler.
 */
export class FullscreenDecoupledEditorHandler extends FullscreenAbstractEditorHandler {
	/**
	 * An editor instance.
	 */
	protected override readonly _editor: DecoupledEditor;

	/**
	 * @inheritDoc
	 */
	constructor( editor: DecoupledEditor ) {
		super( editor );

		this._editor = editor;
	}

	/**
	 * A function that moves the editor UI elements to the fullscreen mode.
	 */
	public override defaultOnEnter(): HTMLElement {
		const editable = this._editor.ui.getEditableElement()!;

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* v8 ignore next -- @preserve */
		if ( this._editor.plugins.has( 'Pagination' ) && ( this._editor.plugins.get( 'Pagination' ) as any ).isEnabled ) {
			const paginationViewElement = getParentNode( editable )?.querySelector<HTMLElement>( '.ck-pagination-view' );

			if ( paginationViewElement ) {
				this.moveToFullscreen( paginationViewElement, 'pagination-view' );
			}
		}

		this.moveToFullscreen( editable, 'editable' );
		this.moveToFullscreen( this._editor.ui.view.toolbar.element!, 'toolbar' );

		this._editor.ui.view.toolbar.switchBehavior(
			this._editor.config.get( 'fullscreen.toolbar.shouldNotGroupWhenFull' ) === true ? 'static' : 'dynamic'
		);

		if ( this._editor.config.get( 'fullscreen.menuBar.isVisible' ) ) {
			this.moveToFullscreen( this._editor.ui.view.menuBarView.element!, 'menu-bar' );
		}

		return this.getWrapper();
	}
}
