/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editingkeystrokehandler
 */

import { KeystrokeHandler, type PriorityString } from '@ckeditor/ckeditor5-utils';

import type Editor from './editor/editor';

/**
 * A keystroke handler for editor editing. Its instance is available
 * in {@link module:core/editor/editor~Editor#keystrokes} so plugins
 * can register their keystrokes.
 *
 * E.g. an undo plugin would do this:
 *
 * ```ts
 * editor.keystrokes.set( 'Ctrl+Z', 'undo' );
 * editor.keystrokes.set( 'Ctrl+Shift+Z', 'redo' );
 * editor.keystrokes.set( 'Ctrl+Y', 'redo' );
 * ```
 */
export default class EditingKeystrokeHandler extends KeystrokeHandler {
	/**
	 * The editor instance.
	 */
	public readonly editor: Editor;

	/**
	 * Creates an instance of the keystroke handler.
	 */
	constructor( editor: Editor ) {
		super();
		this.editor = editor;
	}

	/**
	 * Registers a handler for the specified keystroke.
	 *
	 * The handler can be specified as a command name or a callback.
	 *
	 * @param keystroke Keystroke defined in a format accepted by
	 * the {@link module:utils/keyboard~parseKeystroke} function.
	 * @param callback If a string is passed, then the keystroke will
	 * {@link module:core/editor/editor~Editor#execute execute a command}.
	 * If a function, then it will be called with the
	 * {@link module:engine/view/observer/keyobserver~KeyEventData key event data} object and
	 * a `cancel()` helper to both `preventDefault()` and `stopPropagation()` of the event.
	 * @param options Additional options.
	 * @param options.priority The priority of the keystroke callback. The higher the priority value
	 * the sooner the callback will be executed. Keystrokes having the same priority
	 * are called in the order they were added.
	 */
	public override set(
		keystroke: string | Array<string | number>,
		callback: EditingKeystrokeCallback,
		options: { readonly priority?: PriorityString } = {}
	): void {
		if ( typeof callback == 'string' ) {
			const commandName = callback;

			callback = ( evtData, cancel ) => {
				this.editor.execute( commandName );
				cancel();
			};
		}

		super.set( keystroke, callback, options );
	}
}

/**
 * Command name or a callback to be executed when a given keystroke is pressed.
 */
export type EditingKeystrokeCallback = string | ( ( ev: KeyboardEvent, cancel: () => void ) => void );
