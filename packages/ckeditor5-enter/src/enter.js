/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/enter
 */

import Plugin from '../core/plugin.js';
import EnterCommand from './entercommand.js';
import EnterObserver from './enterobserver.js';

/**
 * The Enter feature. Handles the <kbd>Enter</kbd> and <kbd>Shift + Enter</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Enter extends Plugin {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( EnterObserver );

		editor.commands.set( 'enter', new EnterCommand( editor ) );

		// TODO We may use the keystroke handler for that.
		this.listenTo( editingView, 'enter', ( evt, data ) => {
			editor.execute( 'enter' );
			data.preventDefault();
		}, { priority: 'low' } );
	}
}
