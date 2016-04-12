/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from './utils/emittermixin.js';
import KeyObserver from './engine/treeview/observer/keyobserver.js';
import { getCode, parseKeystroke } from './utils/keyboard.js';

/**
 * Keystroke handler.
 *
 * @memberOf ckeditor5
 */
export default class KeystrokeHandler {
	/**
	 * @param {engine.treeView.TreeView} editingView
	 */
	constructor( editor ) {
		this.editor = editor;

		this._observer = Object.create( EmitterMixin );
		this._keystrokes = new Map();

		editor.editing.view.addObserver( KeyObserver );
		this._observer.listenTo( editor.editing.view, 'keydown', ( evt, data ) => {
			const handled = this.press( data );

			if ( handled ) {
				data.preventDefault();
			}
		} );
	}

	/**
	 * @param {String|Array.<String|Number>} keystroke Keystroke defined in a format accepted by
	 * the {@link utils.keyboard.parseKeystroke} function.
	 * @param {String|Function} callback If a string is passed, then the keystroke will trigger a command.
	 * If a function, then it will be called with the {@link {utils.keyboard.KeystrokeInfo keystroke info} object.
	 */
	add( keystroke, callback ) {
		this._keystrokes.set( parseKeystroke( keystroke ), callback );
	}

	/**
	 *
	 * @param {utils.keyboard.KeystrokeInfo} keystrokeInfo Keystroke info object.
	 * @returns {Boolean} Whether the keystroke was handled.
	 */
	press( keystrokeInfo ) {
		const keyCode = getCode( keystrokeInfo );
		const callback = this._keystrokes.get( keyCode );

		if ( !callback ) {
			return false;
		}

		if ( typeof callback == 'string' ) {
			this.editor.execute( callback );
		} else {
			callback( keystrokeInfo );
		}

		return true;
	}

	destroy() {
		this._keystrokes = new Map();
		this._observer.stopListening();
	}
}
