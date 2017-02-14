/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/inputcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';

/**
 * The input command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 *
 * @extends module:core/command/command~Command
 */
export default class InputCommand extends Command {
	/**
	 * Executes the input command. It replaces the content within the given range with the given text.
	 * Replacing is a two step process, first content within the range is removed and then new text is inserted
	 * on the beginning of the range (which after removal is a collapsed range).
	 *
	 * @param {Object} [options] The command options.
	 * @param {String} [options.text=''] Text to be inserted.
	 * @param {module:engine/model/range~Range} [options.range] Range in which the text is inserted. Defaults
	 * to the first range in the current selection.
	 * @param {module:engine/model/position~Position} [options.selectionAnchor] Selection anchor which will be used
	 * to set selection on a data model.
	 * @param {module:typing/changebuffer~ChangeBuffer} [options.buffer]
	 */
	_doExecute( options = {} ) {
		const doc = this.editor.document;
		const range = options.range || doc.selection.getFirstRange();
		const text = options.text || '';
		const selectionAnchor = options.selectionAnchor;
		const buffer = options.buffer;
		let textInsertions = 0;

		if ( range && buffer ) {
			doc.enqueueChanges( () => {
				const isCollapsedRange = range.isCollapsed;

				if ( !isCollapsedRange ) {
					buffer.batch.remove( range );
				}

				if ( text ) {
					textInsertions = text.length;
					buffer.batch.weakInsert( range.start, text );
				}

				if ( selectionAnchor ) {
					this.editor.data.model.selection.collapse( selectionAnchor );
				} else if ( isCollapsedRange ) {
					// If range was collapsed just shift the selection by the number of inserted characters.
					this.editor.data.model.selection.collapse( range.start.getShiftedBy( textInsertions ) );
				}

				buffer.input( textInsertions );
			} );
		}
	}
}
