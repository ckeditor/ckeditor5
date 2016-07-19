/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../feature.js';
import EnterCommand from './entercommand.js';
import EnterObserver from './enterobserver.js';

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

		editingView.addObserver( EnterObserver );

		editor.commands.set( 'enter', new EnterCommand( editor ) );

		// TODO We may use keystroke handler for that.
		this.listenTo( editingView, 'enter', ( evt, data ) => {
			editor.execute( 'enter' );
			data.preventDefault();
		} );
	}
}
