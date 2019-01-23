/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/delete
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DeleteCommand from './deletecommand';
import DeleteObserver from './deleteobserver';

import injectAndroidBackspaceMutationsHandling from './utils/injectandroidbackspacemutationshandling';

/**
 * The delete and backspace feature. Handles the <kbd>Delete</kbd> and <kbd>Backspace</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Delete extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Delete';
	}

	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		view.addObserver( DeleteObserver );

		editor.commands.add( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
		editor.commands.add( 'delete', new DeleteCommand( editor, 'backward' ) );

		this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			editor.execute( data.direction == 'forward' ? 'forwardDelete' : 'delete', { unit: data.unit, sequence: data.sequence } );
			data.preventDefault();
			view.scrollToTheSelection();
		} );

		injectAndroidBackspaceMutationsHandling( editor );
	}
}
