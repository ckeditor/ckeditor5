/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module remove-format/removeformatcommand
 */

import type { ModelDocumentSelection, ModelItem, ModelRange, ModelWriter } from 'ckeditor5/src/engine.js';
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
	 * @inheritDoc
	 */
	public override execute(): void {
		const model = this.editor.model;

		model.change( writer => {
			for ( const item of this._getFormattingItems( model.document.selection ) ) {
				if ( item.is( 'selection' ) ) {
					for ( const attributeName of this._getFormattingAttributes( item ) ) {
						writer.removeSelectionAttribute( attributeName );
					}
				} else {
					// Workaround for items with multiple removable attributes. See
					// https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
					const itemRange = writer.createRangeOn( item );

					for ( const attributeName of this._getFormattingAttributes( item ) ) {
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

		for ( const { isFormatting, removeFormatting } of this._customAttributesHandlers ) {
			if ( isFormatting( attributeName, item ) ) {
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
	 */
	private* _getFormattingItems( selection: ModelDocumentSelection ) {
		const model = this.editor.model;
		const schema = model.schema;

		const itemHasRemovableFormatting = ( item: ModelItem | ModelDocumentSelection ) => {
			return !!first( this._getFormattingAttributes( item ) );
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
	 * @returns The names of formatting attributes found in a given item.
	 */
	private* _getFormattingAttributes( item: ModelItem | ModelDocumentSelection ) {
		const schema = this.editor.model.schema;

		for ( const [ attributeName ] of item.getAttributes() ) {
			for ( const { isFormatting } of this._customAttributesHandlers ) {
				if ( isFormatting( attributeName, item ) ) {
					yield attributeName;
				}
			}

			const attributeProperties = schema.getAttributeProperties( attributeName );

			if ( attributeProperties && attributeProperties.isFormatting ) {
				yield attributeName;
			}
		}
	}
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
