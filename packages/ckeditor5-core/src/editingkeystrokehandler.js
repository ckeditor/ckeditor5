/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editingkeystrokehandler
 */

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

/**
 * A keystroke handler for editor editing. Its instance is available
 * in {@link module:core/editor/editor~Editor#keystrokes} so plugins
 * can register their keystrokes.
 *
 * E.g. an undo plugin would do this:
 *
 *		editor.keystrokes.set( 'Ctrl+Z', 'undo' );
 *		editor.keystrokes.set( 'Ctrl+Shift+Z', 'redo' );
 *		editor.keystrokes.set( 'Ctrl+Y', 'redo' );
 *
 * @extends module:utils/keystrokehandler~KeystrokeHandler
 */
export default class EditingKeystrokeHandler extends KeystrokeHandler {
	/**
	 * Creates an instance of the keystroke handler.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		super();

		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor}
		 */
		this.editor = editor;
	}

	/**
	 * Registers a handler for the specified keystroke.
	 *
	 * The handler can be specified as a command name or a callback.
	 *
	 * @param {String|Array.<String|Number>} keystroke Keystroke defined in a format accepted by
	 * the {@link module:utils/keyboard~parseKeystroke} function.
	 * @param {Function|String} callback If a string is passed, then the keystroke will
	 * {@link module:core/editor/editor~Editor#execute execute a command}.
	 * If a function, then it will be called with the
	 * {@link module:engine/view/observer/keyobserver~KeyEventData key event data} object and
	 * a `cancel()` helper to both `preventDefault()` and `stopPropagation()` of the event.
	 * @param {Object} [options={}] Additional options.
	 * @param {module:utils/priorities~PriorityString|Number} [options.priority='normal'] The priority of the keystroke
	 * callback. The higher the priority value the sooner the callback will be executed. Keystrokes having the same priority
	 * are called in the order they were added.
	 */
	set( keystroke, callback, options = {} ) {
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
