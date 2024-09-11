/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformatcommand
 */

import { isEmpty, omit } from 'lodash-es';

import type { DocumentSelection, Item, Schema } from 'ckeditor5/src/engine.js';
import type { GHSViewAttributes } from '@ckeditor/ckeditor5-html-support';

import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';

/**
 * The remove format command.
 *
 * It is used by the {@link module:remove-format/removeformat~RemoveFormat remove format feature}
 * to clear the formatting in the selection.
 *
 * ```ts
 * editor.execute( 'removeFormat' );
 * ```
 */
export default class RemoveFormatCommand extends Command {
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;

		this.isEnabled = !!first( this._getFormattingItems( model.document.selection, model.schema ) );
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const model = this.editor.model;
		const schema = model.schema;

		model.change( writer => {
			for ( const item of this._getFormattingItems( model.document.selection, schema ) ) {
				if ( item.is( 'selection' ) ) {
					for ( const attributeName of this._getFormattingAttributes( item, schema ) ) {
						writer.removeSelectionAttribute( attributeName );
					}

					continue;
				}

				// Workaround for items with multiple removable attributes. See
				// https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
				const itemRange = writer.createRangeOn( item );

				// Remove GHS formatting attributes.
				const ghsFormattingAttributes = this._getGHSFormattingAttributes( item );

				for ( const [ name, attributeValue ] of ghsFormattingAttributes ) {
					const filteredAttributeValue = omit(
						attributeValue,
						[ 'classes', 'styles' ] satisfies Array<keyof GHSViewAttributes>
					);

					// Remove GHS attribute if it's empty after removal of classes and styles.
					if ( isEmpty( filteredAttributeValue ) ) {
						writer.removeAttribute( name, itemRange );
					} else {
						writer.setAttribute( name, filteredAttributeValue, itemRange );
					}
				}

				// Remove formatting attributes.
				for ( const attributeName of this._getFormattingAttributes( item, schema ) ) {
					writer.removeAttribute( attributeName, itemRange );
				}
			}
		} );
	}

	/**
	 * Returns an iterable of items in a selection (including the selection itself) that have formatting model
	 * attributes to be removed by the feature.
	 *
	 * @param schema The schema describing the item.
	 */
	private* _getFormattingItems( selection: DocumentSelection, schema: Schema ) {
		const itemHasRemovableFormatting = ( item: Item | DocumentSelection ) => {
			if ( this._getGHSFormattingAttributes( item ).size ) {
				return true;
			}

			return !!first( this._getFormattingAttributes( item, schema ) );
		};

		// Check formatting on selected items that are not blocks.
		for ( const curRange of selection.getRanges() ) {
			for ( const item of curRange.getItems() ) {
				if ( !schema.isBlock( item ) && itemHasRemovableFormatting( item ) ) {
					yield item;
				}
			}
		}

		// Check formatting from selected blocks.
		for ( const block of selection.getSelectedBlocks() ) {
			if ( itemHasRemovableFormatting( block ) ) {
				yield block;
			}
		}

		// Finally the selection might be formatted as well, so make sure to check it.
		if ( itemHasRemovableFormatting( selection ) ) {
			yield selection;
		}
	}

	/**
	 * Returns an iterable of formatting attributes of a given model item.
	 *
	 * **Note:** Formatting items have the `isFormatting` property set to `true`.
	 *
	 * @param schema The schema describing the item.
	 * @returns The names of formatting attributes found in a given item.
	 */
	private* _getFormattingAttributes( item: Item | DocumentSelection, schema: Schema ) {
		for ( const [ attributeName ] of item.getAttributes() ) {
			const attributeProperties = schema.getAttributeProperties( attributeName );

			if ( attributeProperties && attributeProperties.isFormatting ) {
				yield attributeName;
			}
		}
	}

	/**
	 * Returns map of GHS formatting attributes of a given model item.
	 *
	 * @returns The map of GHS formatting attributes found in a given item.
	 */
	private _getGHSFormattingAttributes( item: Item | DocumentSelection ): Map<string, GHSViewAttributes> {
		const { plugins } = this.editor;

		// GHS formatting attributes should be returned only for elements.
		if ( !item.is( 'element' ) ) {
			return new Map();
		}

		// GHS attributes are supported only when the GeneralHtmlSupport plugin is enabled.
		if ( !plugins.has( 'GeneralHtmlSupport' ) ) {
			return new Map();
		}

		const htmlSupport = plugins.get( 'GeneralHtmlSupport' );
		const ghsAttributes = htmlSupport.getGhsAttributesForElement( item );

		for ( const [ name, attribute ] of ghsAttributes.entries() ) {
			const hasNoStyles = !attribute.styles || !Object.keys( attribute.styles ).length;
			const hasNoClasses = !attribute.classes || !attribute.classes.length;

			if ( hasNoStyles && hasNoClasses ) {
				ghsAttributes.delete( name );
			}
		}

		return ghsAttributes;
	}
}
