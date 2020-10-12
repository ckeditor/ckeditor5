/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The HTML embed command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HTMLEmbedEditing} as `'htmlEmbed'`.
 *
 * To insert a HTML code at the current selection, execute the command:
 *
 *		editor.execute( 'htmlEmbed', { html: 'HTML to insert.' } );
 *
 * @extends module:core/command~Command
 */
export default class HTMLEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
	}
}
