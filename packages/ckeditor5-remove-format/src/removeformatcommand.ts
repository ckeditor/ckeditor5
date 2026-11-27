/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module remove-format/removeformatcommand
 */

import type { ModelDocumentSelection, ModelItem, ModelRange, ModelWriter } from '@ckeditor/ckeditor5-engine';
import { Command } from '@ckeditor/ckeditor5-core';
import { first } from '@ckeditor/ckeditor5-utils';

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
export class RemoveFormatCommand extends Command {
	declare public value: boolean;

	/**
	 * List of all registered custom attribute handlers.
	 */
	private _customAttributesHandlers: Array<{
		isFormatting: IsFormattingCallback;
		removeFormatting: RemoveFormattingCallback;
	}> = [];

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;

		this.isEnabled = !!first( this._getFormattingItems( model.document.selection ) );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 */
	public override execute( options: RemoveFormatCommandOptions = {} ): void {
		const model = this.editor.model;
		const textFormattingOnly = !!options._textFormattingOnly;

		model.change( writer => {
			for ( const item of this._getFormattingItems( model.document.selection, textFormattingOnly ) ) {
				if ( item.is( 'selection' ) ) {
					for ( const attributeName of this._getFormattingAttributes( item, textFormattingOnly ) ) {
						writer.removeSelectionAttribute( attributeName );
					}
				} else {
					// Workaround for items with multiple removable attributes. See
					// https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
					const itemRange = writer.createRangeOn( item );

					for ( const attributeName of this._getFormattingAttributes( item, textFormattingOnly ) ) {
						this._removeFormatting( attributeName, item, itemRange, writer );
					}
				}
			}
		} );
	}

	/**
	 * Registers a custom attribute handler that will be used to determine if an attribute is formatting and how to remove it.
	 *
	 * @internal
	 */
	public registerCustomAttribute( isFormatting: IsFormattingCallback, removeFormatting: RemoveFormattingCallback ): void {
		this._customAttributesHandlers.push( {
			isFormatting,
			removeFormatting
		} );
	}

	/**
	 * Helper method that removes a formatting attribute from an item either using custom callbacks or writer remove attribute.
	 */
	private _removeFormatting( attributeName: string, item: ModelItem, itemRange: ModelRange, writer: ModelWriter ) {
		let customHandled = false;
		const nonSelectionAttributeName = toNonSelectionAttribute( attributeName );

		for ( const { isFormatting, removeFormatting } of this._customAttributesHandlers ) {
			if ( isFormatting( nonSelectionAttributeName, item ) ) {
				removeFormatting( attributeName, itemRange, writer );
				customHandled = true;
			}
		}

		if ( !customHandled ) {
			writer.removeAttribute( attributeName, itemRange );
		}
	}

	/**
	 * Returns an iterable of items in a selection (including the selection itself) that have formatting model
	 * attributes to be removed by the feature.
	 *
	 * @param textFormattingOnly Whether to take into account only the formatting attributes allowed on `$text`.
	 */
	private* _getFormattingItems( selection: ModelDocumentSelection, textFormattingOnly = false ) {
		const model = this.editor.model;
		const schema = model.schema;

		const itemHasRemovableFormatting = ( item: ModelItem | ModelDocumentSelection ) => {
			return !!first( this._getFormattingAttributes( item, textFormattingOnly ) );
		};

		// Check formatting on selected items.
		for ( const curRange of selection.getRanges() ) {
			for ( const item of curRange.getItems() ) {
				// Ignore last block if range ends at the beginning of it.
				if ( schema.isBlock( item ) && curRange.end.isTouching( model.createPositionAt( item, 0 ) ) ) {
					continue;
				}

				if ( itemHasRemovableFormatting( item ) ) {
					yield item;
				}
			}
		}

		// Check formatting from selected blocks (to include partly selected blocks).
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
	 * @param textFormattingOnly Whether to return only the formatting attributes allowed on `$text`.
	 * @returns The names of formatting attributes found in a given item.
	 */
	private* _getFormattingAttributes( item: ModelItem | ModelDocumentSelection, textFormattingOnly = false ) {
		const { schema } = this.editor.model;

		for ( const [ attributeName ] of item.getAttributes() ) {
			const nonSelectionAttributeName = toNonSelectionAttribute( attributeName );

			if ( textFormattingOnly && !schema.checkAttribute( '$text', nonSelectionAttributeName ) ) {
				continue;
			}

			for ( const { isFormatting } of this._customAttributesHandlers ) {
				if ( isFormatting( nonSelectionAttributeName, item ) ) {
					yield attributeName;
				}
			}

			const attributeProperties = schema.getAttributeProperties( nonSelectionAttributeName );

			if ( attributeProperties && attributeProperties.isFormatting ) {
				yield attributeName;
			}
		}
	}
}

/**
 * The options of the {@link module:remove-format/removeformatcommand~RemoveFormatCommand#execute remove format command}.
 */
export interface RemoveFormatCommandOptions {

	/**
	 * If set to `true`, the command removes only the formatting attributes that the schema allows on `$text`.
	 * The formatting of blocks and other elements, for example alignment or table cell properties, is kept.
	 * The check is made for `$text` regardless of its position in the content, so an attribute allowed on text
	 * only in a specific context is kept. The option is not taken into account by `isEnabled`. Defaults to `false`.
	 *
	 * @internal
	 */
	_textFormattingOnly?: boolean;
}

/**
 * Helper function that converts a selection attribute name to a non-selection one. E.g. `selection:bold` to `bold`.
 */
function toNonSelectionAttribute( attributeName: string ) {
	return attributeName.replace( /^selection:/, '' );
}

/**
 * Callback that checks if an attribute is a formatting attribute.
 *
 * @internal
 */
export type IsFormattingCallback = ( attributeName: string, item: ModelItem | ModelDocumentSelection ) => boolean;

/**
 * Callback that removes formatting from an item.
 *
 * @internal
 */
export type RemoveFormattingCallback = ( attributeName: string, range: ModelRange, writer: ModelWriter ) => void;
