/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module select-all/selectallcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The select all command.
 *
 * It is used by the {@link module:select-all/selectallediting~SelectAllEditing select all editing feature} to handle
 * the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke.
 *
 * Executing this command changes the {@glink framework/guides/architecture/editing-engine#model model}
 * selection so it contains the entire content of the editable root of the editor the selection is
 * {@link module:engine/model/selection~Selection#anchor anchored} in.
 *
 * If the selection was anchored in a {@glink framework/guides/tutorials/implementing-a-block-widget nested editable}
 * (e.g. a caption of an image), the new selection will contain its entire content.
 * Successive execution - selecting all if entire content is selected - expands selection to the parent editable.
 *
 * @extends module:core/command~Command
 */
export default class SelectAllCommand extends Command {
	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;
		let scopeElement = model.schema.getLimitElement( selection );

		// If an entire scope is selected, or the selection's ancestor is not a scope yet,
		// browse through ancestors to find the enclosing parent scope.
		if ( selection.containsEntireContent( scopeElement ) || !isSelectAllScope( model.schema, scopeElement ) ) {
			do {
				scopeElement = scopeElement.parent;
				// Do nothing, if the entire `root` is already selected.
				if ( !scopeElement ) {
					return;
				}
			} while ( !isSelectAllScope( model.schema, scopeElement ) );
		}

		model.change( writer => {
			writer.setSelection( scopeElement, 'in' );
		} );
	}
}

// Checks whether the element is a valid select-all scope.
// Returns true, it the element {@link module:engine/model/schema~Schema#isLimit `isLimit()`},
// and can contain any text or paragraph.
// @param {module:engine/model/schema~Schema} schema The schema to cheng against.
// @param {module:engine/model/element~Element} element
// @return {Boolean}
function isSelectAllScope( schema, element ) {
	return schema.isLimit( element ) && ( schema.checkChild( element, '$text' ) || schema.checkChild( element, 'paragraph' ) );
}
