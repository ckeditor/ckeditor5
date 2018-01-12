/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/removehighlightcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The remove highlight command. It is used by the {@link module:highlight/highlightediting~HighlightEditing highlight feature}
 * to remove text highlighting.
 *
 * @extends module:core/command~Command
 */
export default class RemoveHighlightCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = false;
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'highlight' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 */
	execute() {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		// Do nothing on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'highlight' );

			for ( const range of ranges ) {
				writer.removeAttribute( range, 'highlight' );
			}
		} );
	}
}
