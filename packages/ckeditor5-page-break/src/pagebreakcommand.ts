/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module page-break/pagebreakcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget.js';
import type { DocumentSelection, Element, Model, Schema } from 'ckeditor5/src/engine.js';

/**
 * The page break command.
 *
 * The command is registered by {@link module:page-break/pagebreakediting~PageBreakEditing} as `'pageBreak'`.
 *
 * To insert a page break at the current selection, execute the command:
 *
 *		editor.execute( 'pageBreak' );
 */
export default class PageBreakCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
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
	public override execute(): void {
		const model = this.editor.model;

		model.change( writer => {
			const pageBreakElement = writer.createElement( 'pageBreak' );

			model.insertObject( pageBreakElement, null, null, {
				setSelection: 'after'
			} );
		} );
	}
}

/**
 * Checks if a page break is allowed by the schema in the optimal insertion parent.
 */
function isPageBreakAllowedInParent( selection: DocumentSelection, schema: Schema, model: Model ): boolean {
	const parent = getInsertPageBreakParent( selection, model );

	return schema.checkChild( parent, 'pageBreak' );
}

/**
 * Returns a node that will be used to insert a page break with `model.insertContent` to check if the page break can be placed there.
 */
function getInsertPageBreakParent( selection: DocumentSelection, model: Model ): Element {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent as Element;
	}

	return parent as Element;
}
