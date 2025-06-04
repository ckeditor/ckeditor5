/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreencommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import type { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';

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
	 *
	 * If you want to add support for a new editor type (for now, only Classic and Decoupled editors are handled),
	 * create a custom handler that extends `AbstractEditorHandler` and replace `fullscreenHandler` with it after editor initialization:
	 *
	 * ```ts
	 * // See the details of how to implement a custom handler in the `AbstractEditorHandler` class API docs.
	 * class CustomEditorHandler extends AbstractEditorHandler {}
	 *
	 * CustomEditorClass.create( document.querySelector( '#editor' ), {} )
	 * 	.then( ( editor ) => {
	 * 		editor.commands.get( 'toggleFullscreen' ).fullscreenHandler = new CustomEditorHandler( editor );
	 * 	} );
	 * ```
	 */
	public fullscreenHandler: AbstractEditorHandler;

	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		super( editor );

		this.affectsData = false;
		this.isEnabled = true;
		this.value = false;

		// Choose the appropriate handler based on the editor type.
		// Currently only `ClassicEditor` and `DecoupledEditor` are supported. For other editor types, you should create a custom handler
		// that extends `AbstractEditorHandler` and replace `fullscreenHandler` with it.
		if ( isClassicEditor( editor ) ) {
			this.fullscreenHandler = new ClassicEditorHandler( editor );
		} else if ( isDecoupledEditor( editor ) ) {
			this.fullscreenHandler = new DecoupledEditorHandler( editor );
		} else {
			this.fullscreenHandler = new AbstractEditorHandler( editor );
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
		this.fullscreenHandler.enable();

		this.value = true;
	}

	/**
	 * Disables the fullscreen mode.
	 */
	private _disableFullscreenMode(): void {
		this.fullscreenHandler.disable();

		this.value = false;
	}
}

/**
 * Classic editor typeguard.
 */
function isClassicEditor( editor: Editor ): editor is ClassicEditor {
	return ( editor.constructor as typeof Editor ).editorName === 'ClassicEditor';
}

/**
 * Decoupled editor typeguard.
 */
function isDecoupledEditor( editor: Editor ): editor is DecoupledEditor {
	return ( editor.constructor as typeof Editor ).editorName === 'DecoupledEditor';
}
