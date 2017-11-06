/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The highlight command.
 *
 * @extends module:core/command~Command
 */
export default class HighlightCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'left'|'right'|'center'|'justify'} type Highlight type to be handled by this command.
	 */
	constructor( editor, type ) {
		super( editor );

		/**
		 * The type of the list created by the command.
		 *
		 * @readonly
		 * @member {'left'|'right'|'center'|'justify'}
		 */
		this.type = type;

		/**
		 * A flag indicating whether the command is active, which means that the selection starts in a block
		 * that has defined highlight of the same type.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

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
	 * @param {String} options.class Name of marker class name.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const selection = doc.selection;
		const value = options.class;

		if ( selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			const ranges = doc.schema.getValidRanges( selection.getRanges(), 'highlight' );
			const batch = options.batch || doc.batch();

			for ( const range of ranges ) {
				if ( value ) {
					batch.setAttribute( range, 'highlight', value );
				} else {
					batch.removeAttribute( range, 'highlight' );
				}
			}
		} );
	}
}
