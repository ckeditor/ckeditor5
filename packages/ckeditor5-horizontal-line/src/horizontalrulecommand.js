/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/horizontalrulecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The insert a horizontal rule command.
 *
 * The command is registered by the {@link module:horizontal-rule/horizontalruleediting~HorizontalRuleEditing} as `'horizontalRule'`.
 *
 * To insert the horizontal rule at the current selection, execute the command:
 *
 *		editor.execute( 'horizontalRule' );
 *
 * @extends module:core/command~Command
 */
export default class HorizontalRuleCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isHorizontalRuleAllowed( this.editor.model );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			const horizontalElement = writer.createElement( 'horizontalRule' );

			model.insertContent( horizontalElement );

			let nextElement = horizontalElement.nextSibling;

			// Check whether an element next to the inserted horizontal rule is defined and can contain a text.
			const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

			// If the element is missing, but a paragraph could be inserted next to the horizontal rule, let's add it.
			if ( !canSetSelection && model.schema.checkChild( horizontalElement.parent, 'paragraph' ) ) {
				nextElement = writer.createElement( 'paragraph' );

				writer.insert( nextElement, writer.createPositionAfter( horizontalElement ) );
			}

			// Put the selection inside the element, at the beginning.
			if ( nextElement ) {
				writer.setSelection( nextElement, 0 );
			}
		} );
	}
}

// Checks if the `horizontalRule` element can be inserted at current model selection.
//
// @param {module:engine/model/model~Model} model
// @returns {Boolean}
function isHorizontalRuleAllowed( model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isHorizontalRuleAllowedInParent( selection, schema, model ) &&
		!checkSelectionOnObject( selection, schema );
}

// Checks if horizontal rule is allowed by schema in optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isHorizontalRuleAllowedInParent( selection, schema, model ) {
	const parent = getInsertHorizontalRuleParent( selection, model );

	return schema.checkChild( parent, 'horizontalRule' );
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

// Returns a node that will be used to insert horizontal rule with `model.insertContent` to check if horizontal rule can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertHorizontalRuleParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
