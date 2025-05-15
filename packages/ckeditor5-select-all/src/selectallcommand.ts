/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module select-all/selectallcommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { Element, Schema } from '@ckeditor/ckeditor5-engine';

/**
 * The select all command.
 *
 * It is used by the {@link module:select-all/selectallediting~SelectAllEditing select all editing feature} to handle
 * the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke.
 *
 * Executing this command changes the {@glink framework/architecture/editing-engine#model model}
 * selection so it contains the entire content of the editable root of the editor the selection is
 * {@link module:engine/model/selection~Selection#anchor anchored} in.
 *
 * If the selection was anchored in a {@glink framework/tutorials/widgets/implementing-a-block-widget nested editable}
 * (e.g. a caption of an image), the new selection will contain its entire content. Successive executions of this command
 * will expand the selection to encompass more and more content up to the entire editable root of the editor.
 */
export default class SelectAllCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		let scopeElement: Element | null = model.schema.getLimitElement( selection );

		// If an entire scope is selected, or the selection's ancestor is not a scope yet,
		// browse through ancestors to find the enclosing parent scope.
		if ( selection.containsEntireContent( scopeElement ) || !isSelectAllScope( model.schema, scopeElement ) ) {
			do {
				scopeElement = scopeElement.parent as Element | null;

				// Do nothing, if the entire `root` is already selected.
				if ( !scopeElement ) {
					return;
				}
			} while ( !isSelectAllScope( model.schema, scopeElement ) );
		}

		model.change( writer => {
			writer.setSelection( scopeElement!, 'in' );
		} );
	}
}

/**
 * Checks whether the element is a valid select-all scope. Returns true, if the element is a
 * {@link module:engine/model/schema~Schema#isLimit limit}, and can contain any text or paragraph.
 *
 * @param schema Schema to check against.
 * @param element Model element.
 */
function isSelectAllScope( schema: Schema, element: Element ): boolean {
	return schema.isLimit( element ) && ( schema.checkChild( element, '$text' ) || schema.checkChild( element, 'paragraph' ) );
}
