/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The base font command.
 *
 * @extends module:core/command~Command
 */
export default class FontCommand extends Command {
	/**
	 * Creates a new `FontCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {String} attribute Name of an model attribute on which this command operates.
	 */
	constructor( editor, attribute ) {
		super( editor );

		/**
		 * If is set it means that selection has `attribute` set.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} module:font/fontcommand~FontCommand#value
		 */

		/**
		 * A model attribute on which this command operates.
		 *
		 * @readonly
		 * @member {Boolean} module:font/fontcommand~FontCommand#attribute
		 */
		this.attribute = attribute;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( this.attribute );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, this.attribute );
	}

	/**
	 * Executes the command. Applies the the attribute `value` to a selection. If no value is passed it removes attribute from selection.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] a value to apply.
	 *
	 * @fires execute
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
				if ( value ) {
					writer.setAttribute( this.attribute, value, range );
				} else {
					writer.removeAttribute( this.attribute, range );
				}
			}
		} );
	}
}
