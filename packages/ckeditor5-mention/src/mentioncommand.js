/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentioncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The mention command.
 *
 * @extends module:core/command~Command
 */
export default class MentionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		// @todo implement refresh
		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.marker='@'] The mention marker.
	 * @param {String} options.mention.
	 * @param {String} [options.range].
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const marker = options.marker || '@';

		const mention = options.mention;
		const range = options.range || selection.getFirstRange();

		const name = mention.name || mention;

		model.change( writer => {
			writer.remove( range );

			writer.insertText( `${ marker }${ name }`, { mention }, range.start );
			writer.insertText( ' ', model.document.selection.focus );
		} );
	}
}
