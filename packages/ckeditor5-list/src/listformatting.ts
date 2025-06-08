/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import ListItemFontFamilyIntegration from './listformatting/listitemfontfamilyintegration.js';
// import ListEditing from '../src/list/listediting.js';
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
 * The list formatting plugin. It enables integration with formatting plugins to style the list marker.
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
		return [ ListItemFontFamilyIntegration ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		for ( const listItemFormatAttribute in this._loadedFormattings ) {
			this._registerPostfixerForListItemFormatting(
				listItemFormatAttribute,
				this._loadedFormattings[ listItemFormatAttribute ]
			);
		}
	}

	/**
	 * TODO
	 */
	private _registerPostfixerForListItemFormatting(
		listItemFormatAttributeName: string,
		formatAttributeName: string
	): void {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const modifiedListItems = new Set<Element>();
			let returnValue = false;

			// for ( const entry of changes ) {
			// 	if ( entry.type == 'attribute' && entry.attributeKey == `selection:${ formatAttributeName }` ) {
			// 		addIfListItem( modifiedListItems, entry.range.start.nodeAfter );
			// 	}

			// 	else if ( entry.type == 'attribute' && entry.attributeKey == formatAttributeName ) {
			// 		addIfListItem( modifiedListItems, entry.range.start.parent );
			// 	}

			// 	else if (
			// 		entry.type == 'attribute' &&
			// 		entry.attributeKey == 'listItemId'
			// 	) {
			// 		addIfListItem( modifiedListItems, entry.range.start.nodeAfter );
			// 	}

			// 	else if ( ( entry.type == 'insert' || entry.type == 'remove' ) && entry.name == '$text' ) {
			// 		addIfListItem( modifiedListItems, entry.position.parent );
			// 	}

			// 	else if ( entry.type == 'insert' ) {
			// 		addIfListItem( modifiedListItems, entry.position.nodeAfter );
			// 	}

			// 	else if ( entry.type == 'remove' ) {
			// 		addIfListItem( modifiedListItems, entry.position.parent );
			// 	}
			// }

			for ( const entry of changes ) {
				if (
					entry.type == 'attribute' &&
					entry.range &&
					entry.range.start
				) {
					if ( entry.range.start.nodeAfter && entry.range.start.nodeAfter.is( 'element' ) ) {
						addIfListItem( modifiedListItems, entry.range.start.nodeAfter );
					} else if ( entry.range.start.parent ) {
						addIfListItem( modifiedListItems, entry.range.start.parent );
					}
				}
				else if (
					( entry.type == 'insert' || entry.type == 'remove' ) &&
					entry.position
				) {
					let isElement = false;

					if ( entry.position.nodeAfter && entry.position.nodeAfter.is( 'element' ) ) {
						addIfListItem( modifiedListItems, entry.position.nodeAfter );
						isElement = true;
					}

					if ( entry.position.nodeBefore && entry.position.nodeBefore.is( 'element' ) ) {
						addIfListItem( modifiedListItems, entry.position.nodeBefore );
						isElement = true;
					}

					if ( !isElement && entry.position.parent ) {
						addIfListItem( modifiedListItems, entry.position.parent );
					}
				}
			}

			for ( const listItem of modifiedListItems ) {
				const format = this._getListItemConsistentFormat( model, listItem, formatAttributeName );

				if ( !format ) {
					continue;
				}

				if ( format.isConsistent ) {
					if ( format.value ) {
						if ( listItem.getAttribute( listItemFormatAttributeName ) !== format.value ) {
							this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, format.value );
							returnValue = true;
						}
					} else {
						// TODO: tables etc.
						// First try to get format from selection.
						const selectionFormat = listItem.getAttribute( `selection:${ formatAttributeName }` ) as string;

						if ( selectionFormat ) {
							if ( listItem.getAttribute( listItemFormatAttributeName ) !== selectionFormat ) {
								this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, selectionFormat );
								returnValue = true;
							}
						} else if ( listItem.hasAttribute( listItemFormatAttributeName ) ) {
							this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
							returnValue = true;
						}
					}
				} else if ( listItem.hasAttribute( listItemFormatAttributeName ) ) {
					this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
					returnValue = true;
				}
			}

			return returnValue;
		} );
	}

	/**
	 * TODO
	 */
	private _addFormattingToListItem(
		writer: Writer,
		listItem: Element,
		attributeKey: string,
		attributeValue: string
	): void {
		// Multi-block items should have consistent formatting.
		const affectedListItems = getAllListItemBlocks( listItem );

		for ( const listItem of affectedListItems ) {
			if ( !listItem.hasAttribute( attributeKey ) || listItem.getAttribute( attributeKey ) !== attributeValue ) {
				writer.setAttribute( attributeKey, attributeValue, listItem );
			}
		}

		// TODO: add a flag if was changed
	}

	/**
	 * TODO
	 */
	private _removeFormattingFromListItem(
		writer: Writer,
		listItem: Element,
		attributeKey: string
	): void {
		// Multi-block items should have consistent formatting.
		const affectedListItems = getAllListItemBlocks( listItem );

		for ( const listItem of affectedListItems ) {
			if ( listItem.hasAttribute( attributeKey ) ) {
				writer.removeAttribute( attributeKey, listItem );
			}
		}

		// TODO: add a flag if was changed
	}

	/**
	 * TODO
	 */
	private _getListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ): ListItemFormatting | undefined {
		// In case of multi-block, check if all blocks have the same format.
		const affectedListItems = getAllListItemBlocks( listItem );
		let format: ListItemFormatting | undefined;

		for ( const listItem of affectedListItems ) {
			// First block.
			if ( format === undefined ) {
				format = this._getSingleListItemConsistentFormat( model, listItem, attributeKey );

				if ( !format.isConsistent ) {
					return format;
				}

				continue;
			}

			// Next blocks.
			const nextBlockFormat = this._getSingleListItemConsistentFormat( model, listItem, attributeKey );

			if ( !nextBlockFormat.isConsistent ) {
				format.isConsistent = false;
				break;
			}

			if (
				nextBlockFormat.isConsistent &&
				nextBlockFormat.value !== format.value
			) {
				format.isConsistent = false;
				break;
			}
		}

		return format;
	}

	/**
	 * TODO
	 */
	private _getSingleListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ): ListItemFormatting {
		let isConsistent = true;
		let value;

		// TODO: check other elements like e.g. table.

		if ( listItem.isEmpty ) {
			// Check if format is set on the selection.
			const selectionFormat = listItem.getAttribute( `selection:${ attributeKey }` ) as string;
			value = selectionFormat ? selectionFormat : value;

			return {
				isConsistent,
				value
			};
		}

		for ( const child of listItem.getChildren() ) {
			if ( model.schema.checkAttribute( child, attributeKey ) ) {
				const formatAttribute = child.getAttribute( attributeKey ) as string;

				if ( formatAttribute === undefined ) {
					isConsistent = false;
					break;
				} else if ( value === undefined ) { // First item
					value = formatAttribute;
				} else if ( value !== formatAttribute ) { // Second and next items
					isConsistent = false;
					break;
				}
			}
		}

		return {
			isConsistent,
			value
		};
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
		if ( !this._loadedFormattings[ listItemFormatAttribute ] ) {
			this._loadedFormattings[ listItemFormatAttribute ] = formatAttribute;
		}
	}
}

function addIfListItem( modifiedListItems: Set<Element>, item: any ): void {
	if ( item && item.is( 'element' ) && isListItemBlock( item ) ) {
		modifiedListItems.add( item );
	}
}

type ListItemFormatting = {
	isConsistent: boolean;
	value?: string;
};
