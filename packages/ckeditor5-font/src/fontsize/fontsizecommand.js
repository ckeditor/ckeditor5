/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsizecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The font size command. It is used by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing FontSizeEditing feature}
 * to apply font size.
 *
 * @extends module:core/command~Command
 */
export default class FontSizeCommand extends Command {
	constructor( editor, fontSize ) {
		super( editor );

		/**
		 * Name of font size config.
		 */
		this.fontSize = fontSize;

		/**
		 * A flag indicating whether the command is active, which means that the selection has fontSize attribute set.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} module:font/fontsizecommand~FontSizeCommand#value
		 */
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const doc = this.editor.document;

		this.value = doc.selection.getAttribute( 'fontSize' ) === this.fontSize;
		this.isEnabled = doc.schema.checkAttributeInSelection( doc.selection, 'fontSize' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const selection = doc.selection;

		// Do not apply fontSize on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			const ranges = doc.schema.getValidRanges( selection.getRanges(), 'fontSize' );
			const batch = options.batch || doc.batch();

			for ( const range of ranges ) {
				batch.setAttribute( 'fontSize', this.fontSize, range );
			}
		} );
	}
}
