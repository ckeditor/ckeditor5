/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/enter
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import EnterCommand from './entercommand';
import EnterObserver from './enterobserver';

/**
 * The Enter feature. Handles the <kbd>Enter</kbd> and <kbd>Shift + Enter</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Enter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Enter';
	}

	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( EnterObserver );

		editor.commands.add( 'enter', new EnterCommand( editor ) );

		// TODO We may use the keystroke handler for that.
		this.listenTo( editingView, 'enter', ( evt, data ) => {
			editor.execute( 'enter' );
			data.preventDefault();
			editingView.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}
