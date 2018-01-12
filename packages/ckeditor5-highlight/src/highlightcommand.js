/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The highlight command. It is used by the {@link module:highlight/highlightediting~HighlightEditing highlight feature}
 * to apply text highlighting.
 *
 * @extends module:core/command~Command
 */
export default class HighlightCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		/**
		 * A flag indicating whether the command is active, which means that the selection has highlight attribute set.
		 *
		 * @observable
		 * @readonly
		 * @member {undefined|String} module:highlight/highlightcommand~HighlightCommand#value
		 */
		this.value = doc.selection.getAttribute( 'highlight' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'highlight' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] a value to apply.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		// Do not apply highlight on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		const value = options.value;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'highlight' );

			for ( const range of ranges ) {
				if ( value ) {
					writer.setAttribute( 'highlight', value, range );
				} else {
					writer.removeAttribute( 'highlight', range );
				}
			}
		} );
	}
}
