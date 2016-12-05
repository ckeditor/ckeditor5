/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/delete
 */

import Plugin from '../core/plugin.js';
import DeleteCommand from './deletecommand.js';
import DeleteObserver from './deleteobserver.js';

/**
 * The delete and backspace feature. Handles the <kbd>Delete</kbd> and <kbd>Backspace</kbd> keys in the editor.
 *
 * @extends core.Plugin
 */
export default class Delete extends Plugin {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( DeleteObserver );

		editor.commands.set( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
		editor.commands.set( 'delete', new DeleteCommand( editor, 'backward' ) );

		this.listenTo( editingView, 'delete', ( evt, data ) => {
			editor.execute( data.direction == 'forward' ? 'forwardDelete' : 'delete', { unit: data.unit } );
			data.preventDefault();
		} );
	}
}
