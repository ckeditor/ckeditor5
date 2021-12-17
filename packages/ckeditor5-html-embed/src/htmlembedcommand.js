/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedcommand
 */

import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget';

/**
 * The insert HTML embed element command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HtmlEmbedEditing} as `'htmlEmbed'`.
 *
 * To insert an empty HTML embed element at the current selection, execute the command:
 *
 *		editor.execute( 'htmlEmbed' );
 *
 * You can specify the initial content of a new HTML embed in the argument:
 *
 *		editor.execute( 'htmlEmbed', '<b>Initial content.</b>' );
 *
 * To update the content of the HTML embed, select it in the model and pass the content in the argument:
 *
 *		editor.execute( 'htmlEmbed', '<b>New content of an existing embed.</b>' );
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
		this.value = selectedRawHtmlElement ? selectedRawHtmlElement.getAttribute( 'value' ) || '' : null;
	}

	/**
	 * Executes the command, which either:
	 *
	 * * creates and inserts a new HTML embed element if none was selected,
	 * * updates the content of the HTML embed if one was selected.
	 *
	 * @fires execute
	 * @param {String} [value] When passed, the value (content) will be set on a new embed or a selected one.
	 */
	execute( value ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			let htmlEmbedElement;

			// If the command has a non-null value, there must be some HTML embed selected in the model.
			if ( this.value !== null ) {
				htmlEmbedElement = getSelectedRawHtmlModelWidget( selection );
			} else {
				htmlEmbedElement = writer.createElement( 'rawHtml' );

				model.insertContent( htmlEmbedElement );
				writer.setSelection( htmlEmbedElement, 'on' );
			}

			writer.setAttribute( 'value', value, htmlEmbedElement );
		} );
	}
}

// Checks if an HTML embed is allowed by the schema in the optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model
// @returns {Boolean}
function isHtmlEmbedAllowedInParent( selection, schema, model ) {
	const parent = getInsertHtmlEmbedParent( selection, model );

	return schema.checkChild( parent, 'rawHtml' );
}

// Returns a node that will be used to insert a html embed with `model.insertContent` to check if a html embed element can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model
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
