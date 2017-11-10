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
		const doc = this.editor.document;

		this.value = doc.selection.getAttribute( 'highlight' );
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

		// Do not apply highlight no collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			const ranges = doc.schema.getValidRanges( selection.getRanges(), 'highlight' );
			const batch = options.batch || doc.batch();

			for ( const range of ranges ) {
				if ( options.class ) {
					batch.setAttribute( range, 'highlight', options.class );
				} else {
					batch.removeAttribute( range, 'highlight' );
				}
			}
		} );
	}
}

/**
 * Holds current highlight class. If there is no highlight in selection then value will be undefined.
 *
 * @observable
 * @readonly
 * @member {undefined|String} module:highlight/highlightcommand~HighlightCommand#value
 */
