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
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		/**
		 * A flag indicating whether the command is active, which means that the selection has fontSize attribute set.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} module:font/fontsizecommand~FontSizeCommand#value
		 */
		this.value = doc.selection.getAttribute( 'fontSize' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'fontSize' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.fontSize] FontSize value to apply.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		// Do not apply fontSize on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		const value = options.fontSize;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'fontSize' );

			for ( const range of ranges ) {
				if ( value !== 'normal' ) {
					writer.setAttribute( 'fontSize', value, range );
				} else {
					writer.removeAttribute( 'fontSize', range );
				}
			}
		} );
	}
}
