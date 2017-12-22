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
export default class FontCommand extends Command {
	/**
	 * TODO: docs me
	 * @param editor
	 * @param attribute
	 */
	constructor( editor, attribute ) {
		super( editor );

		this.attribute = attribute;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		/**
		 * A flag indicating whether the command is active, which means that the selection has fontFamily attribute set.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} module:font/fontfamilycommand~FontFamilyCommand#value
		 */
		this.value = doc.selection.getAttribute( this.attribute );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, this.attribute );
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] a value to apply.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		// Do not apply value on collapsed selection.
		if ( selection.isCollapsed ) {
			return;
		}

		const value = options.value;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), this.attribute );

			for ( const range of ranges ) {
				if ( value && value !== 'default' ) {
					writer.setAttribute( this.attribute, value, range );
				} else {
					writer.removeAttribute( this.attribute, range );
				}
			}
		} );
	}
}
