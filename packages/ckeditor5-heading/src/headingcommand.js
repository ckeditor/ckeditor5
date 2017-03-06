/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';

/**
 * The heading command. It is used by the {@link module:heading/heading~Heading heading feature} to apply headings.
 *
 * @extends module:core/command/command~Command
 */
export default class HeadingCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {module:heading/headingcommand~HeadingOption} option An option to be used by the command instance.
	 */
	constructor( editor, option ) {
		super( editor );

		Object.assign( this, option );

		/**
		 * Value of the command, indicating whether it is applied in the context
		 * of current {@link module:engine/model/document~Document#selection selection}.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean}
		 */
		this.set( 'value', false );

		// Update current value each time changes are done on document.
		this.listenTo( editor.document, 'changesDone', () => this._updateValue() );

		/**
		 * Unique identifier of the command, also element's name in the model.
		 * See {@link module:heading/headingcommand~HeadingOption}.
		 *
		 * @readonly
		 * @member {String} #modelElement
		 */

		/**
		 * Element this command creates in the view.
		 * See {@link module:heading/headingcommand~HeadingOption}.
		 *
		 * @readonly
		 * @member {String} #viewElement
		 */

		/**
		 * User-readable title of the command.
		 * See {@link module:heading/headingcommand~HeadingOption}.
		 *
		 * @readonly
		 * @member {String} #title
		 */
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 */
	_doExecute( options = {} ) {
		const editor = this.editor;
		const document = editor.document;
		const selection = document.selection;
		const ranges = [ ...selection.getRanges() ];
		const isSelectionBackward = selection.isBackward;

		// If current option is same as new option - toggle already applied option back to default one.
		const shouldRemove = this.value;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();

			for ( let element of document.selection.getSelectedBlocks() ) {
				// When removing applied option.
				if ( shouldRemove ) {
					if ( element.name === this.modelElement ) {
						// Apply paragraph to the single element only instead of working
						// on the entire selection. Share the batch with the paragraph command.
						editor.execute( 'paragraph', { element, batch } );
					}
				}
				// When applying new option.
				else {
					batch.rename( element, this.modelElement );
				}
			}

			// If range's selection start/end is placed directly in renamed block - we need to restore it's position
			// after renaming, because renaming puts new element there.
			selection.setRanges( ranges, isSelectionBackward );
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
			this.value = this.modelElement == block.name;
		}
	}
}

/**
 * Heading option descriptor.
 *
 * @typedef {Object} module:heading/headingcommand~HeadingOption
 * @property {String} modelElement Element's name in the model.
 * @property {String} viewElement The name of the view element that will be used to represent the model element in the view.
 * @property {String} title The user-readable title of the option.
 */
