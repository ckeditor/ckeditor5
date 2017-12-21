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
 * TODO: those commands are duplicated here and there - maybe make them one?
 *
 * @extends module:core/command~Command
 */
export default class FontFamilyCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const doc = this.editor.model.document;

		/**
		 * A flag indicating whether the command is active, which means that the selection has fontFamily attribute set.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} module:font/fontfamilycommand~FontFamilyCommand#value
		 */
		this.value = doc.selection.getAttribute( 'fontFamily' );
		this.isEnabled = this.editor.model.schema.checkAttributeInSelection( doc.selection, 'fontFamily' );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.fontFamily] FontSize value to apply.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		// Do not apply fontFamily on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		const value = options.fontFamily;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'fontFamily' );

			for ( const range of ranges ) {
				if ( value !== 'default' ) {
					writer.setAttribute( 'fontFamily', value, range );
				} else {
					writer.removeAttribute( 'fontFamily', range );
				}
			}
		} );
	}
}
