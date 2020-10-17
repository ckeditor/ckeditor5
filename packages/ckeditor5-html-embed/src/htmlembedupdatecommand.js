/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedupdatecommand
 */

import { getSelectedRawHtmlModelWidget } from './utils';
import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The update raw html value command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HTMLEmbedEditing} as `'htmlEmbedUpdate'`.
 *
 * To insert a page break at the current selection, execute the command:
 *
 *		editor.execute( 'htmlEmbedUpdate', 'HTML.' );
 *
 * @extends module:core/command~Command
 */
export default class HTMLEmbedUpdateCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const rawHtmlElement = getSelectedRawHtmlModelWidget( selection );

		this.isEnabled = !!rawHtmlElement;
		this.value = rawHtmlElement ? rawHtmlElement.getAttribute( 'value' ) : '';
	}

	/**
	 * Executes the command, which updates the `value` attribute of the embedded HTML element:
	 *
	 * @fires execute
	 * @param {String} value HTML as a string.
	 */
	execute( value ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedMedia = getSelectedRawHtmlModelWidget( selection );

		if ( selectedMedia ) {
			model.change( writer => {
				writer.setAttribute( 'value', value, selectedMedia );
			} );
		}
	}
}
