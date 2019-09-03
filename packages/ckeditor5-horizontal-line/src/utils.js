/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/utils
 */

import { findOptimalInsertionPosition, isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Converts a given {@link module:engine/view/element~Element} to a horizontal rule widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
 * recognize the horizontal rule widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label.
 * @returns {module:engine/view/element~Element}
 */
export function toHorizontalRuleWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'horizontalRule', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}

/**
 * Checks if a given view element is a horizontal rule widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isHorizontalRuleWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'horizontalRule' ) && isWidget( viewElement );
}

/**
 * Checks if the `horizontalRule` element can be inserted at current model selection.
 *
 * @param {module:engine/model/model~Model} model
 * @returns {Boolean}
 */
export function isHorizontalRuleAllowed( model ) {
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
