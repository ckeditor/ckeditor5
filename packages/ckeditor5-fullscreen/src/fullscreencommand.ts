/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreencommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';

import AbstractEditorHandler from './handlers/abstracteditorhandler.js';
import ClassicEditorHandler from './handlers/classiceditorhandler.js';
import DecoupledEditorHandler from './handlers/decouplededitorhandler.js';

/**
 * A command toggling the fullscreen mode.
 */
export default class FullscreenCommand extends Command {
	/**
	 * Indicates whether the fullscreen mode is enabled.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: boolean;

	/**
	 * Specialized class handling the fullscreen mode toggling for a specific editor type.
	 */
	private _fullscreenHandler: AbstractEditorHandler;

	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		super( editor );

		this.affectsData = false;
		this.isEnabled = true;
		this.value = false;

		// Choose the appropriate handler based on the editor type.
		// Currently only ClassicEditor and DecoupledEditor are supported. For other editor types, the abstract handler is used
		// which will throw if user tries to enable the fullscreen mode.
		if ( editor instanceof ClassicEditor ) {
			this._fullscreenHandler = new ClassicEditorHandler( editor );
		} else if ( editor instanceof DecoupledEditor ) {
			this._fullscreenHandler = new DecoupledEditorHandler( editor );
		} else {
			this._fullscreenHandler = new AbstractEditorHandler( editor );
		}
	}

	/**
	 * Toggles the fullscreen mode.
	 */
	public override execute(): void {
		if ( this.value ) {
			this._disableFullscreenMode();
		} else {
			this._enableFullscreenMode();
		}
	}

	/**
	 * Enables the fullscreen mode.
	 */
	private _enableFullscreenMode(): void {
		this._fullscreenHandler.enable();

		this.value = true;
	}

	/**
	 * Disables the fullscreen mode.
	 */
	private _disableFullscreenMode(): void {
		this._fullscreenHandler.disable();

		this.value = false;
	}
}
