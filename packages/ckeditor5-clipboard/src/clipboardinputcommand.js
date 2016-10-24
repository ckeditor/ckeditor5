/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';

/**
 * The clipboard input command. Used by the {@link clipboard.Clipboard} feature in order to insert
 * content comming from the clipboard into the editor.
 *
 * @memberOf clipboard
 * @extends core.command.Command
 */
export default class ClipboardInputCommand extends Command {
	constructor( editor ) {
		super( editor );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} options
	 * @param {engine.view.DocumentFragment} options.content The content to paste.
	 */
	_doExecute( options = {} ) {
		const doc = this.editor.document;
		const batch = doc.batch();

		doc.enqueueChanges( () => {
			this.editor.data.insertContent( batch, doc.selection, options.content );
		} );
	}
}
