/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguagecommand
 */

import type { LanguageDirection } from 'ckeditor5/src/utils';
import { Command } from 'ckeditor5/src/core';
import { stringifyLanguageAttribute } from './utils';

/**
 * The text part language command plugin.
 */
export default class TextPartLanguageCommand extends Command {
	/**
	 * If the selection starts in a language attribute, the value is set to
	 * the value of that language in the following format:
	 *
	 * ```
	 * <languageCode>:<textDirection>
	 * ```
	 *
	 * * `languageCode` - The language code used for the `lang` attribute in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
	 *    format.
	 * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
	 *
	 * See the {@link module:core/editor/editorconfig~LanguageConfig#textPartLanguage text part language configuration}
	 * for more information about language properties.
	 *
	 * It is set to `false` otherwise.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: false | string;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const doc = model.document;

		this.value = this._getValueFromFirstAllowedNode();
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'language' );
	}

	/**
	 * Executes the command. Applies the attribute to the selection or removes it from the selection.
	 *
	 * If `languageCode` is set to `false` or a `null` value, it will remove attributes. Otherwise, it will set
	 * the attribute in the `{@link #value value}` format.
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
	 * @param options Command options.
	 * @param options.languageCode The language code to be applied to the model.
	 * @param options.textDirection The language text direction.
	 */
	public override execute(
		{ languageCode, textDirection }: { languageCode?: string | false; textDirection?: LanguageDirection } = {}
	): void {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const value = languageCode ? stringifyLanguageAttribute( languageCode, textDirection ) : false;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( 'language', value );
				} else {
					writer.removeSelectionAttribute( 'language' );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'language' );

				for ( const range of ranges ) {
					if ( value ) {
						writer.setAttribute( 'language', value, range );
					} else {
						writer.removeAttribute( 'language', range );
					}
				}
			}
		} );
	}

	/**
	 * Returns the attribute value of the first node in the selection that allows the attribute.
	 * For a collapsed selection it returns the selection attribute.
	 *
	 * @returns The attribute value.
	 */
	private _getValueFromFirstAllowedNode(): false | string {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			return selection.getAttribute( 'language' ) as string || false;
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkAttribute( item, 'language' ) ) {
					return item.getAttribute( 'language' ) as string || false;
				}
			}
		}

		return false;
	}
}
