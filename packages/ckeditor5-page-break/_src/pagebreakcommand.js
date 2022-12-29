/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreakcommand
 */

import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget';

/**
 * The page break command.
 *
 * The command is registered by {@link module:page-break/pagebreakediting~PageBreakEditing} as `'pageBreak'`.
 *
 * To insert a page break at the current selection, execute the command:
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
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		this.isEnabled = isPageBreakAllowedInParent( selection, schema, model );
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

			model.insertObject( pageBreakElement, null, null, {
				setSelection: 'after'
			} );
		} );
	}
}

// Checks if a page break is allowed by the schema in the optimal insertion parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/model~Model} model Model instance.
// @returns {Boolean}
function isPageBreakAllowedInParent( selection, schema, model ) {
	const parent = getInsertPageBreakParent( selection, model );

	return schema.checkChild( parent, 'pageBreak' );
}

// Returns a node that will be used to insert a page break with `model.insertContent` to check if the page break can be placed there.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/model~Model} model Model instance.
// @returns {module:engine/model/element~Element}
function getInsertPageBreakParent( selection, model ) {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
