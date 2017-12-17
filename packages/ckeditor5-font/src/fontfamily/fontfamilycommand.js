/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamilycommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The font family command. It is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
 * to apply font family.
 *
 * @extends module:core/command~Command
 */
export default class FontFamilyCommand extends Command {
	constructor( editor, fontFamily ) {
		super( editor );

		/**
		 * Name of font family config.
		 */
		this.fontFamily = fontFamily;

		/**
		 * A flag indicating whether the command is active, which means that the selection has fontFamily attribute set.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} module:font/fontfamilycommand~FontFamilyCommand#value
		 */
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const doc = this.editor.model.document;

		this.value = doc.selection.getAttribute( 'fontFamily' ) === this.fontFamily;
		this.isEnabled = this.editor.model.schema.checkAttributeInSelection( doc.selection, 'fontFamily' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute() {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		// Do not apply fontFamily on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'fontFamily' );

			for ( const range of ranges ) {
				writer.setAttribute( 'fontFamily', this.fontFamily, range );
			}
		} );
	}
}
