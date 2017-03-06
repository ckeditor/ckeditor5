/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraphcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';

/**
 * The paragraph command.
 *
 * @extends module:core/command/command~Command
 */
export default class ParagraphCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 */
	constructor( editor ) {
		super( editor );

		const t = editor.t;

		/**
		 * Value of the command, indicating whether it is applied in the context
		 * of current {@link module:engine/model/document~Document#selection selection}.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean}
		 */
		this.set( 'value', false );

		/**
		 * User-readable title of the command, for use in the UI.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.title = t( 'Paragraph' );

		// Update current value each time changes are done on document.
		this.listenTo( editor.document, 'changesDone', () => this._updateValue() );
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 * @param {module:engine/model/element~Element} [options.element] Element the command should be applied to.
	 * By default, if not provided, the command is applied to current {@link module:engine/model/document~Document#selection}.
	 */
	_doExecute( options = {} ) {
		if ( this.value && !options.element ) {
			return;
		}

		const document = this.editor.document;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();
			const elements = options.element ? [ options.element ] : document.selection.getSelectedBlocks();

			for ( let element of elements ) {
				batch.rename( element, 'paragraph' );
			}
		} );
	}

	/**
	 * Updates command's {@link #value value} based on current selection.
	 *
	 * @private
	 */
	_updateValue() {
		const block = this.editor.document.selection.getSelectedBlocks().next().value;

		if ( block ) {
			this.value = block.name == 'paragraph';
		}
	}
}
