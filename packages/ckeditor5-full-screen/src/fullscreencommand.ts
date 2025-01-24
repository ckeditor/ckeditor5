/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module full-screen/fullscreencommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';

import AbstractEditorHandler from './handlers/abstracteditor.js';
import ClassicEditorHandler from './handlers/classiceditor.js';
import DecoupledEditorHandler from './handlers/decouplededitor.js';

/**
 * A command toggling the full screen mode.
 */
export default class FullScreenCommand extends Command {
	/**
	 * Indicates whether the full screen mode is enabled.
	 *
	 * @observable
	 * @readonly
	 */
	public override value = false;

	/**
	 * Specialized class handling the full screen mode toggling for a specific editor type.
	 */
	private _fullScreenHandler: AbstractEditorHandler;

	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		super( editor );

		// Choose the appropriate handler based on the editor type.
		// Currently only ClassicEditor and DecoupledEditor are supported. For other editor types, the abstract handler is used
		// which will throw if user tries to enable the full screen mode.
		if ( editor instanceof ClassicEditor ) {
			this._fullScreenHandler = new ClassicEditorHandler( editor );
		} else if ( editor instanceof DecoupledEditor ) {
			this._fullScreenHandler = new DecoupledEditorHandler( editor );
		} else {
			this._fullScreenHandler = new AbstractEditorHandler();
		}
	}

	/**
	 * Toggles the full screen mode.
	 */
	public override execute(): void {
		if ( this.value ) {
			this._disableFullScreenMode();
		} else {
			this._enableFullScreenMode();
		}
	}

	/**
	 * Enables the full screen mode.
	 */
	private _enableFullScreenMode(): void {
		document.body.classList.add( 'ck-fullscreen' );

		this._fullScreenHandler.enable();

		this.value = true;
	}

	/**
	 * Disables the full screen mode.
	 */
	private _disableFullScreenMode(): void {
		document.body.classList.remove( 'ck-fullscreen' );

		this._fullScreenHandler.disable();

		this.value = false;
	}
}
