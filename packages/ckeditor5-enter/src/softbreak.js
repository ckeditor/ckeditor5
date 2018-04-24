/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/enter
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SoftBreakEditing from './softbreakediting';
import SoftBreakCommand from './softbreakcommand';
import SoftBreakObserver from './softbreakobserver';

/**
 * The Enter feature. Handles the <kbd>Enter</kbd> and <kbd>Shift + Enter</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SoftBreak extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SoftBreak';
	}

	static get requires() {
		return [ SoftBreakEditing ];
	}

	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		view.addObserver( SoftBreakObserver );

		editor.commands.add( 'softbreak', new SoftBreakCommand( editor ) );

		// TODO We may use the keystroke handler for that.
		this.listenTo( viewDocument, 'softbreak', ( evt, data ) => {
			editor.execute( 'softbreak' );
			data.preventDefault();
			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}
