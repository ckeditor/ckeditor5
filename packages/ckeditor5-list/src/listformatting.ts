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
import type {
	Element,
	Model,
	Writer
} from 'ckeditor5/src/engine.js';

import {
	isListItemBlock,
	getAllListItemBlocks
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
			ListItemBoldIntegration
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
						Object.values( this._loadedFormattings ).some( key =>
							entry.attributeKey === key ||
							entry.attributeKey === `selection:${ key }`
						)
					) {
						if ( isListItemBlock( entry.range.start.nodeAfter ) ) {
							modifiedListItems.add( entry.range.start.nodeAfter );
						} else {
							if ( isListItemBlock( entry.range.start.parent ) ) {
								modifiedListItems.add( entry.range.start.parent );
							}
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
				}
			}

			for ( const listItem of modifiedListItems ) {
				for ( const listItemFormatAttributeName in this._loadedFormattings ) {
					const formatAttributeName = this._loadedFormattings[ listItemFormatAttributeName ];
					const format = getListItemConsistentFormat( model, listItem, formatAttributeName );

					if ( format.isConsistent ) {
						if ( format.value ) {
							if ( listItem.getAttribute( listItemFormatAttributeName ) !== format.value ) {
								returnValue = returnValue || addFormattingToListItem(
									writer,
									listItem,
									listItemFormatAttributeName,
									format.value
								);
							}
						} else {
							if (
								listItem.hasAttribute( listItemFormatAttributeName ) &&
								!model.schema.isLimit( listItem ) // Do not remove formatting from limit elements (e.g. tables).
							) {
								returnValue = returnValue || removeFormattingFromListItem(
									writer,
									listItem,
									listItemFormatAttributeName
								);
							}
						}
					} else if ( listItem.hasAttribute( listItemFormatAttributeName ) ) {
						returnValue = returnValue || removeFormattingFromListItem(
							writer,
							listItem,
							listItemFormatAttributeName
						);
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
}

/**
 * Returns the consistent format of the list item element.
 * It checks consistency also for multi-block list items.
 * If the list item is empty, it checks the selection format.
 */
function getListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ) {
	// In case of multi-block, check if all blocks have the same format.
	const listItemBlocks = getAllListItemBlocks( listItem );
	let format: { isConsistent: boolean; value?: string };

	for ( let i = 0; i < listItemBlocks.length; i++ ) {
		const listItemBlock = listItemBlocks[ i ];
		const blockFormat = getSingleListItemConsistentFormat( model, listItemBlock, attributeKey );

		if ( i == 0 ) {
			format = blockFormat;

			if ( !format.isConsistent ) {
				return format;
			}

			continue;
		}

		if ( !blockFormat.isConsistent ) {
			return {
				isConsistent: false,
				value: undefined
			};
		}

		if (
			blockFormat.isConsistent &&
			blockFormat.value !== format!.value
		) {
			return {
				isConsistent: false,
				value: undefined
			};
		}
	}

	return format!;
}

/**
 * Returns the consistent format of a single list item element.
 */
function getSingleListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ) {
	let value;

	if ( listItem.isEmpty ) {
		const selectionFormat = listItem.getAttribute( `selection:${ attributeKey }` ) as string;
		value = selectionFormat || value;

		return {
			isConsistent: true,
			value
		};
	}

	if ( model.schema.isLimit( listItem ) ) {
		return {
			isConsistent: true,
			value
		};
	}

	const range = model.createRangeIn( listItem );

	for ( const child of range.getItems() ) {
		if ( model.schema.checkAttribute( child, attributeKey ) ) {
			const formatAttribute = child.getAttribute( attributeKey ) as string;

			if ( formatAttribute === undefined ) {
				return {
					isConsistent: false,
					value: undefined
				};
			} else if ( value === undefined ) { // First item
				value = formatAttribute;
			} else if ( value !== formatAttribute ) { // Second and next items
				return {
					isConsistent: false,
					value: undefined
				};
			}
		}
	}

	return {
		isConsistent: true,
		value
	};
}

/**
 * Adds the specified formatting attribute to the list item element.
 */
function addFormattingToListItem(
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
