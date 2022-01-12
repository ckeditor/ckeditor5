/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-line/horizontallinecommand
 */

import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget';

/**
 * The horizontal line command.
 *
 * The command is registered by {@link module:horizontal-line/horizontallineediting~HorizontalLineEditing} as `'horizontalLine'`.
 *
 * To insert a horizontal line at the current selection, execute the command:
 *
 *		editor.execute( 'horizontalLine' );
 *
 * @extends module:core/command~Command
 */
export default class HorizontalLineCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		this.isEnabled = isHorizontalLineAllowedInParent( selection, schema, model );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			const horizontalElement = writer.createElement( 'horizontalLine' );

			model.insertContent( horizontalElement );

			let nextElement = horizontalElement.nextSibling;

			// Check whether an element next to the inserted horizontal line is defined and can contain a text.
			const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

			// If the element is missing, but a paragraph could be inserted next to the horizontal line, let's add it.
			if ( !canSetSelection && model.schema.checkChild( horizontalElement.parent, 'paragraph' ) ) {
				nextElement = writer.createElement( 'paragraph' );

				model.insertContent( nextElement, writer.createPositionAfter( horizontalElement ) );
			}

			// Put the selection inside the element, at the beginning.
			if ( nextElement ) {
				writer.setSelection( nextElement, 0 );
			}
		} );
	}
}

// Checks if a horizontal line is allowed by the schema in the optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isHorizontalLineAllowedInParent( selection, schema, model ) {
	const parent = getInsertHorizontalLineParent( selection, model );

	return schema.checkChild( parent, 'horizontalLine' );
}

// Returns a node that will be used to insert a horizontal line with `model.insertContent` to check if the horizontal line can be
// placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertHorizontalLineParent( selection, model ) {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
