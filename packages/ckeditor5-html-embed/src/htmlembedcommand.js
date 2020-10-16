/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import { getSelectedRawHtmlModelWidget, insertRawHtml } from './utils';

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
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const insertPosition = findOptimalInsertionPosition( selection, model );
		const selectedRawHtml = getSelectedRawHtmlModelWidget( selection );

		let parent = insertPosition.parent;

		// The model.insertContent() will remove empty parent (unless it is a $root or a limit).
		if ( parent.isEmpty && !model.schema.isLimit( parent ) ) {
			parent = parent.parent;
		}

		this.value = selectedRawHtml ? selectedRawHtml.getAttribute( 'value' ) : null;
		this.isEnabled = schema.checkChild( parent, 'rawHtml' );
	}

	/**
	 * Executes the command, which either:
	 *
	 * * updates the URL of the selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param {Object} [options={}] The command options.
	 * @param {String} [options.rawHtml] A HTML string that will be inserted into the editor.
	 * @param {module:engine/model/element~Element|null} [options.element] If present, the `value` attribute will be updated
	 * with the specified `options.rawHtml` value. Otherwise, a new element will be inserted into the editor.
	 */
	execute( options = {} ) {
		const model = this.editor.model;

		const rawHtml = options.rawHtml;
		const element = options.element;

		if ( element ) {
			model.change( writer => {
				writer.setAttribute( 'value', rawHtml, element );
			} );
		} else {
			insertRawHtml( model, rawHtml );
		}
	}
}
