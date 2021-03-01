/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/updatehtmlembedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The update HTML embed value command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HtmlEmbedEditing} as `'updateHtmlEmbed'`.
 *
 * To update the value of the HTML embed element at the current selection, execute the command:
 *
 *		editor.execute( 'updateHtmlEmbed', '<b>HTML.</b>' );
 *
 * @extends module:core/command~Command
 */
export default class UpdateHtmlEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const rawHtmlElement = getSelectedRawHtmlModelWidget( selection );

		this.isEnabled = !!rawHtmlElement;
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
		const selectedRawHtmlElement = getSelectedRawHtmlModelWidget( selection );

		model.change( writer => {
			writer.setAttribute( 'value', value, selectedRawHtmlElement );
		} );
	}
}

// Returns the selected HTML embed element in the model, if any.
//
// @param {module:engine/model/selection~Selection} selection
// @returns {module:engine/model/element~Element|null}
function getSelectedRawHtmlModelWidget( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'rawHtml' ) ) {
		return selectedElement;
	}

	return null;
}
