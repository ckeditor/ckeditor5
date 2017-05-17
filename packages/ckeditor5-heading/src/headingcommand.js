/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingcommand
 */

import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Command from '@ckeditor/ckeditor5-core/src/command/command';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import first from '@ckeditor/ckeditor5-utils/src/first';

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
		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshValue();
			this.refreshState();
		} );

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

		// If current option is same as new option - toggle already applied option back to default one.
		const shouldRemove = this.value;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();

			for ( const block of document.selection.getSelectedBlocks() ) {
				// When removing applied option.
				if ( shouldRemove ) {
					if ( block.is( this.modelElement ) ) {
						// Apply paragraph to the selection withing that particular block only instead
						// of working on the entire document selection.
						const selection = new Selection();
						selection.addRange( Range.createIn( block ) );

						// Share the batch with the paragraph command.
						editor.execute( 'paragraph', { selection, batch } );
					}
				}
				// When applying new option.
				else if ( !block.is( this.modelElement ) ) {
					batch.rename( block, this.modelElement );
				}
			}
		} );
	}

	/**
	 * Updates command's {@link #value value} based on current selection.
	 */
	refreshValue() {
		const block = first( this.editor.document.selection.getSelectedBlocks() );

		this.value = !!block && block.is( this.modelElement );
	}

	/**
	 * @inheritDoc
	 */
	_checkEnabled() {
		const block = first( this.editor.document.selection.getSelectedBlocks() );

		return !!block && this.editor.document.schema.check( {
			name: this.modelElement,
			inside: Position.createBefore( block )
		} );
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
