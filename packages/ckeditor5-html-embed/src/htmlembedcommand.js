/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/inserthtmlembedcommand
 */

import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget';

/**
 * The insert HTML embed element command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HtmlEmbedEditing} as `'htmlEmbed'`.
 *
 * To insert the HTML embed element at the current selection, execute the command:
 *
 *		editor.execute( 'htmlEmbed' );
 *
 * To update the content of the HTML embed, select it in the content and specify the value:
 *
 *		editor.execute( 'htmlEmbed', '<b>HTML.</b>' );
 *
 * @extends module:core/command~Command
 */
export default class HtmlEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;
		const selectedRawHtmlElement = getSelectedRawHtmlModelWidget( selection );

		this.isEnabled = isHtmlEmbedAllowedInParent( selection, schema, model );
		this.value = selectedRawHtmlElement ? selectedRawHtmlElement.getAttribute( 'value' ) : null;
	}

	/**
	 * Executes the command, which either:
	 *
	 * * creates and inserts a new HTML embed element if none was selected,
	 * * updates the content of the HTML embed if one was selected.
	 *
	 * @fires execute
	 * @param {String} [value] The new content (value) of the embed (used only if selected in the model).
	 */
	execute( value ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( this.value !== null ) {
				writer.setAttribute( 'value', value, getSelectedRawHtmlModelWidget( selection ) );
			} else {
				const rawHtmlElement = writer.createElement( 'rawHtml' );

				model.insertContent( rawHtmlElement );
				writer.setSelection( rawHtmlElement, 'on' );
			}
		} );
	}
}

// Checks if an HTML embed is allowed by the schema in the optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isHtmlEmbedAllowedInParent( selection, schema, model ) {
	const parent = getInsertHtmlEmbedParent( selection, model );

	return schema.checkChild( parent, 'rawHtml' );
}

// Returns a node that will be used to insert a html embed with `model.insertContent` to check if a html embed element can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertHtmlEmbedParent( selection, model ) {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
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
