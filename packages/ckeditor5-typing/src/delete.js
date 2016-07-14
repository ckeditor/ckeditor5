/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import DeleteCommand from './deletecommand.js';
import DeleteObserver from './deleteobserver.js';

/**
 * The delete and backspace feature. Handles <kbd>Delete</kbd> and <kbd>Backspace</kbd> keys in the editor.
 *
 * @memberOf delete
 * @extends ckeditor5.Feature
 */
export default class Delete extends Feature {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( DeleteObserver );

		editor.commands.set( 'forwardDelete', new DeleteCommand( editor, 'FORWARD' ) );
		editor.commands.set( 'delete', new DeleteCommand( editor, 'BACKWARD' ) );

		this.listenTo( editingView, 'delete', ( evt, data ) => {
			editor.execute( data.direction == 'FORWARD' ? 'forwardDelete' : 'delete' );
			data.preventDefault();
		} );
	}
}
