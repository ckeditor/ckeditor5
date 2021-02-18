/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/languagecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The language command plugin.
 *
 * @extends module:core/command~Command
 */
export default class LanguageCommand extends Command {
	/**
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {String} attributeKey Attribute that will be set by the command.
	 */
	constructor( editor, attributeKey ) {
		super( editor );

		/**
		 * The attribute that will be set by the command.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.attributeKey = attributeKey;

		/**
		 * If the selection starts in a language attribute the value is set to the code of that language.
		 *
		 * It is  set to `false` otherwise.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean|String} #value
		 */
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = this._getValueFromFirstAllowedNode();
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, this.attributeKey );
	}

	/**
	 * @fires execute
	 * @param {Object} [options] Command options.
	 * @param {String} [options.value] Language code to be applied to the model.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const value = options.value;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( this.attributeKey, value );
				} else {
					writer.removeSelectionAttribute( this.attributeKey );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), this.attributeKey );

				for ( const range of ranges ) {
					if ( value ) {
						writer.setAttribute( this.attributeKey, value, range );
					} else {
						writer.removeAttribute( this.attributeKey, range );
					}
				}
			}
		} );
	}

	/**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection returns the selection attribute.
	 *
	 * @private
	 * @returns {Boolean} The attribute value.
	 */
	_getValueFromFirstAllowedNode() {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			return selection.getAttribute( this.attributeKey ) || false;
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkAttribute( item, this.attributeKey ) ) {
					return item.getAttribute( this.attributeKey ) || false;
				}
			}
		}

		return false;
	}
}
