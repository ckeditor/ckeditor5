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
		const doc = this.editor.document;

		this.value = false;
		this.isEnabled = doc.schema.checkAttributeInSelection( doc.selection, 'highlight' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} options.class Name of highlighter class.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const selection = doc.selection;

		// Do nothing on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			const ranges = doc.schema.getValidRanges( selection.getRanges(), 'highlight' );
			const batch = options.batch || doc.batch();

			for ( const range of ranges ) {
				batch.removeAttribute( range, 'highlight' );
			}
		} );
	}
}
