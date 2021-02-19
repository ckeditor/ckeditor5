/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/languagecommand
 */

import { Command } from 'ckeditor5/src/core';
import { parseLanguageToString } from './utils';

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
		 * If the selection starts in a language attribute the value is set to
		 * the value of that language in a format:
		 *
		 *		<languageCode>:<textDirection>
		 *
		 * * `languageCode` - The language code used for the lang attribute in ISO 639 format.
		 * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
		 *
		 * See {@link module:language/language~LanguageConfig language config} for more information about language properties.
		 *
		 * It is set to `false` otherwise.
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
	 * Executes the command. Applies the attribute to the selection or removes it from the selection.
	 *
	 * If `languageCode` is set to `false` or `null` value, it will remove attributes. Otherwise, it will set
	 * attribute in `{@link #value value}` format.
	 *
	 * The execution result differs, depending on the {@link module:engine/model/document~Document#selection}:
	 *
	 * * If the selection is on a range, the command applies the attribute to all nodes in that range
	 * (if they are allowed to have this attribute by the {@link module:engine/model/schema~Schema schema}).
	 * * If the selection is collapsed in a non-empty node, the command applies the attribute to the
	 * {@link module:engine/model/document~Document#selection} itself (note that typed characters copy attributes from the selection).
	 * * If the selection is collapsed in an empty node, the command applies the attribute to the parent node of the selection (note
	 * that the selection inherits all attributes from a node if it is in an empty node).
	 *
	 * @fires execute
	 * @param {Object} [options] Command options.
	 * @param {String|Boolean} [options.languageCode] Language code to be applied to the model.
	 * @param {String} [options.textDirection] Language text direction.
	 */
	execute( { languageCode, textDirection } = {} ) {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const value = languageCode ? parseLanguageToString( languageCode, textDirection ) : false;

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
	 * Returns the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection returns the selection attribute.
	 *
	 * @private
	 * @returns {Object} The attribute value.
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
