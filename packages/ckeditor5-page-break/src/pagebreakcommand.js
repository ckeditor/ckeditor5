/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreakcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The insert a page break command.
 *
 * The command is registered by the {@link module:page-break/pagebreakediting~PageBreakEditing} as `'pageBreak'`.
 *
 * To insert the page break at the current selection, execute the command:
 *
 *		editor.execute( 'pageBreak' );
 *
 * @extends module:core/command~Command
 */
export default class PageBreakCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isPageBreakAllowed( this.editor.model );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			const pageBreakElement = writer.createElement( 'pageBreak' );

			model.insertContent( pageBreakElement );

			let nextElement = pageBreakElement.nextSibling;

			// Check whether an element next to the inserted page break is defined and can contain a text.
			const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

			// If the element is missing, but a paragraph could be inserted next to the page break, let's add it.
			if ( !canSetSelection && model.schema.checkChild( pageBreakElement.parent, 'paragraph' ) ) {
				nextElement = writer.createElement( 'paragraph' );

				writer.insert( nextElement, writer.createPositionAfter( pageBreakElement ) );
			}

			// Put the selection inside the element, at the beginning.
			if ( nextElement ) {
				writer.setSelection( nextElement, 0 );
			}
		} );
	}
}

// Checks if the `pageBreak` element can be inserted at current model selection.
//
// @param {module:engine/model/model~Model} model
// @returns {Boolean}
function isPageBreakAllowed( model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isPageBreakAllowedInParent( selection, schema, model ) &&
		!checkSelectionOnObject( selection, schema );
}

// Checks if page break is allowed by schema in optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isPageBreakAllowedInParent( selection, schema, model ) {
	const parent = getInsertPageBreakParent( selection, model );

	return schema.checkChild( parent, 'pageBreak' );
}

// Check if selection is on object.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function checkSelectionOnObject( selection, schema ) {
	const selectedElement = selection.getSelectedElement();

	return selectedElement && schema.isObject( selectedElement );
}

// Returns a node that will be used to insert page break with `model.insertContent` to check if page break can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertPageBreakParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
