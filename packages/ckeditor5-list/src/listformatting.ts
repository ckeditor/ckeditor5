/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import ListItemFontFamilyIntegration from './listformatting/listitemfontfamilyintegration.js';
import ListItemBoldIntegration from './listformatting/listitemboldintegration.js';
import ListItemItalicIntegration from './listformatting/listitemitalicintegration.js';
import type {
	Element,
	Model,
	Writer
} from 'ckeditor5/src/engine.js';

import {
	isListItemBlock,
	getAllListItemBlocks,
	isFirstBlockOfListItem
} from '../src/list/utils/model.js';

import '../theme/listformatting.css';

/**
 * The list formatting plugin.
 *
 * It enables integration with formatting plugins to style the list marker.
 * The list marker is styled based on the consistent formatting applied to the content of the list item.
 *
 * The list of supported formatting plugins includes:
 * * Font color.
 * * Font size.
 * * Font family.
 * * Bold.
 * * Italic.
 */
export default class ListFormatting extends Plugin {
	/**
	 * The list of loaded formattings.
	 */
	private readonly _loadedFormattings: Record<string, string> = {};

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListFormatting' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [
			ListItemFontFamilyIntegration,
			ListItemBoldIntegration,
			ListItemItalicIntegration
		] as const;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._registerPostfixerForListItemFormatting();
	}

	/**
	 * Registers a postfixer that ensures that the list item formatting attribute is consistent with the formatting
	 * applied to the content of the list item.
	 */
	private _registerPostfixerForListItemFormatting(): void {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const modifiedListItems = new Set<Element>();
			let returnValue = false;

			for ( const entry of changes ) {
				if ( entry.type === 'attribute' ) {
					if (
						entry.attributeKey == 'listItemId' ||
						this._isInlineOrSelectionFormatting( entry.attributeKey )
					) {
						if ( isListItemBlock( entry.range.start.nodeAfter ) ) {
							modifiedListItems.add( entry.range.start.nodeAfter );
						}
						else if ( isListItemBlock( entry.range.start.parent ) ) {
							modifiedListItems.add( entry.range.start.parent );
						}
					}
				}
				else {
					if ( isListItemBlock( entry.position.nodeAfter ) ) {
						modifiedListItems.add( entry.position.nodeAfter );
					}

					if ( isListItemBlock( entry.position.nodeBefore ) ) {
						modifiedListItems.add( entry.position.nodeBefore );
					}

					if ( isListItemBlock( entry.position.parent ) ) {
						modifiedListItems.add( entry.position.parent );
					}

					if ( entry.type == 'insert' && entry.name != '$text' ) {
						const range = writer.createRangeIn( entry.position.nodeAfter as Element );

						for ( const item of range.getItems() ) {
							if ( isListItemBlock( item ) ) {
								modifiedListItems.add( item );
							}
						}
					}
				}
			}

			for ( const listItem of modifiedListItems ) {
				for ( const listItemFormatAttributeName in this._loadedFormattings ) {
					const formatAttributeName = this._loadedFormattings[ listItemFormatAttributeName ];
					const format = getListItemConsistentFormat( model, listItem, formatAttributeName );

					if ( format && setFormattingToListItem( writer, listItem, listItemFormatAttributeName, format ) ) {
						returnValue = true;
					}
					else if ( !format && removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName ) ) {
						returnValue = true;
					}
				}
			}

			return returnValue;
		} );
	}

	/**
	 * Registers an integration between a default attribute (e.g., `fontFamily`) and a new attribute
	 * intended specifically for list item elements (e.g., `listItemFontFamily`).
	 *
	 * These attributes are later used by the postfixer logic to determine whether to add the new attribute
	 * to the list item element, based on whether there is a consistent default formatting attribute
	 * applied within its content.
	 */
	public registerFormatAttribute( listItemFormatAttribute: string, formatAttribute: string ): void {
		this._loadedFormattings[ listItemFormatAttribute ] = formatAttribute;
	}

	/**
	 * Returns true if the given model attribute name is a supported inline formatting attribute.
	 */
	private _isInlineOrSelectionFormatting( attributeKey: string ): boolean {
		return Object.values( this._loadedFormattings ).some( key => attributeKey === key || attributeKey === `selection:${ key }` );
	}
}

/**
 * Returns the consistent format of the list item element.
 * If the list item contains multiple blocks, it checks only the first block.
 */
function getListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ) {
	if ( isFirstBlockOfListItem( listItem ) ) {
		return getSingleListItemConsistentFormat( model, listItem, attributeKey );
	}

	// Always the first block of the list item should be checked for consistent formatting.
	const listItemBlocks = getAllListItemBlocks( listItem );

	return getSingleListItemConsistentFormat( model, listItemBlocks[ 0 ], attributeKey );
}

/**
 * Returns the consistent format of a single list item element.
 */
function getSingleListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ) {
	// Do not check internals of limit elements (for example, do not check table cells).
	if ( model.schema.isLimit( listItem ) ) {
		return;
	}

	if ( listItem.isEmpty ) {
		return listItem.getAttribute( `selection:${ attributeKey }` ) as string;
	}

	const range = model.createRangeIn( listItem );
	const walker = range.getWalker( { ignoreElementEnd: true } );
	let value;

	for ( const { item } of walker ) {
		if ( model.schema.checkAttribute( item, attributeKey ) ) {
			const formatAttribute = item.getAttribute( attributeKey ) as string;

			if ( formatAttribute === undefined ) {
				return;
			}
			else if ( value === undefined ) {
				// First item inside a list item block.
				value = formatAttribute;
			}
			else if ( value !== formatAttribute ) {
				// Following items in the same block of a list item.
				return;
			}

			// Jump over inline limit elements as we expect only outside them to be the same formatting.
			if ( model.schema.isLimit( item ) ) {
				walker.jumpTo( model.createPositionAfter( item ) );
			}
		}
	}

	return value;
}

/**
 * Adds the specified formatting attribute to the list item element.
 */
function setFormattingToListItem(
	writer: Writer,
	listItem: Element,
	attributeKey: string,
	attributeValue: string
): boolean {
	// Multi-block items should have consistent formatting.
	const listItemBlocks = getAllListItemBlocks( listItem );
	let wasChanged = false;

	for ( const listItem of listItemBlocks ) {
		if ( !listItem.hasAttribute( attributeKey ) || listItem.getAttribute( attributeKey ) !== attributeValue ) {
			writer.setAttribute( attributeKey, attributeValue, listItem );
			wasChanged = true;
		}
	}

	return wasChanged;
}

/**
 * Removes the specified formatting attribute from the list item element.
 */
function removeFormattingFromListItem(
	writer: Writer,
	listItem: Element,
	attributeKey: string
): boolean {
	// Multi-block items should have consistent formatting.
	const listItemBlocks = getAllListItemBlocks( listItem );
	let wasChanged = false;

	for ( const listItem of listItemBlocks ) {
		if ( listItem.hasAttribute( attributeKey ) ) {
			writer.removeAttribute( attributeKey, listItem );
			wasChanged = true;
		}
	}

	return wasChanged;
}
