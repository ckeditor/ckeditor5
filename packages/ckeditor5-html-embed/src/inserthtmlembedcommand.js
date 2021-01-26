/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/inserthtmlembedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The insert HTML embed element command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HtmlEmbedEditing} as `'insertHtmlEmbed'`.
 *
 * To insert the HTML embed element at the current selection, execute the command:
 *
 *		editor.execute( 'insertHtmlEmbed' );
 *
 * @extends module:core/command~Command
 */
export default class InsertHtmlEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isHtmlEmbedAllowed( this.editor.model );
	}

	/**
	 * Executes the command, which creates and inserts a new HTML embed element.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			const rawHtmlElement = writer.createElement( 'rawHtml' );

			model.insertContent( rawHtmlElement );
			writer.setSelection( rawHtmlElement, 'on' );
		} );
	}
}

// Checks if the `htmlEmbed` element can be inserted at the current model selection.
//
// @param {module:engine/model/model~Model} model
// @returns {Boolean}
function isHtmlEmbedAllowed( model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isHtmlEmbedAllowedInParent( selection, schema, model ) &&
		!checkSelectionOnObject( selection, schema );
}

// Checks if an HTML embed is allowed by the schema in the optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isHtmlEmbedAllowedInParent( selection, schema, model ) {
	const parent = getInsertPageBreakParent( selection, model );

	return schema.checkChild( parent, 'rawHtml' );
}

// Checks if the selection is on object.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function checkSelectionOnObject( selection, schema ) {
	const selectedElement = selection.getSelectedElement();

	return selectedElement && schema.isObject( selectedElement );
}

// Returns a node that will be used to insert a page break with `model.insertContent` to check if a html embed element can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertPageBreakParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
