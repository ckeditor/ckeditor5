/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import DomEventData from '../engine/treeview/observer/domeventdata.js';
import KeyObserver from '../engine/treeview/observer/keyobserver.js';
import EnterCommand from './entercommand.js';
import { keyCodes } from '../utils/keyboard.js';

/**
 * The enter feature. Handles the <kbd>Enter</kbd> and <kbd>Shift + Enter</kbd> keys in the editor.
 *
 * @memberOf enter
 * @extends ckeditor5.Feature
 */
export default class Enter extends Feature {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( KeyObserver );

		editor.commands.set( 'enter', new EnterCommand( editor ) );

		this.listenTo( editingView, 'keydown', ( evt, data ) => {
			if ( data.keyCode == keyCodes.enter ) {
				editingView.fire( 'enter', new DomEventData( editingView, data.domEvent ) );
			}
		} );

		// TODO We may use keystroke handler for that.
		this.listenTo( editingView, 'enter', ( evt, data ) => {
			editor.execute( 'enter' );
			data.preventDefault();
		} );
	}
}

/**
 * Event fired when the user presses <kbd>Enter</kbd>.
 *
 * Note: This event is fired by the {@link enter.Enter enter feature}.
 *
 * @event engine.treeView.TreeView#enter
 * @param {engine.treeView.observer.DomEventData} data
 */
