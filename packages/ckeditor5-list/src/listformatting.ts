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

import { isListItemBlock } from '../src/list/utils/model.js';

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
	private _addFormattingToListItem(
		writer: Writer,
		listItem: Element,
		attributeKey: string,
		attributeValue: string
	): void {
		if ( !listItem.hasAttribute( attributeKey ) || listItem.getAttribute( attributeKey ) !== attributeValue ) {
			writer.setAttribute( attributeKey, attributeValue, listItem );
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
			let returnValue = false;

			for ( const entry of changes ) {
				// Changing format on text inside a list item.
				if ( entry.type == 'attribute' && entry.attributeKey == formatAttributeName ) {
					const listItem = entry.range.start.parent;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const formatAttribute = entry.attributeNewValue as string | null;
					const listItemFormatAttribute = listItem.getAttribute( listItemFormatAttributeName );

					if ( formatAttribute ) {
						if ( this._getListItemConsistentFormat( model, listItem, formatAttributeName ) ) {
							if ( listItemFormatAttribute !== formatAttribute ) {
								this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, formatAttribute );
								returnValue = true;
							}
						} else if ( listItemFormatAttribute ) {
							this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
							returnValue = true;
						}
					} else if ( listItemFormatAttribute ) {
						this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
						returnValue = true;
					}

					continue;
				}

				// Inserting a text node to a list item.
				if ( entry.type == 'insert' && entry.name == '$text' ) {
					const listItem = entry.position.parent;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const formatAttribute = this._getListItemConsistentFormat( model, listItem, formatAttributeName );
					const listItemFormatAttribute = listItem.getAttribute( listItemFormatAttributeName );

					if ( formatAttribute ) {
						if ( listItemFormatAttribute != formatAttribute ) {
							this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, formatAttribute );
							returnValue = true;
						} else {
							continue;
						}
					} else {
						if ( listItem.hasAttribute( listItemFormatAttributeName ) ) {
							this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
							returnValue = true;
						}
					}

					continue;
				}

				// Removing a text node from a list item.
				if ( entry.type == 'remove' && entry.name == '$text' ) {
					const listItem = entry.position.parent;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const formatAttribute = this._getListItemConsistentFormat( model, listItem, formatAttributeName );
					const listItemFormatAttribute = listItem.getAttribute( listItemFormatAttributeName );

					if ( formatAttribute ) {
						if ( listItemFormatAttribute != formatAttribute ) {
							this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, formatAttribute );
							returnValue = true;
						} else {
							continue;
						}
					} else {
						if ( listItemFormatAttribute ) {
							this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
							returnValue = true;
						}
					}

					continue;
				}

				// Inserting a list item.
				if ( entry.type == 'insert' ) {
					const listItem = entry.position.nodeAfter;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const formatAttribute = this._getListItemConsistentFormat( model, listItem, formatAttributeName );

					if ( formatAttribute && !listItem.getAttribute( listItemFormatAttributeName ) ) {
						this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, formatAttribute );
						returnValue = true;
					}

					continue;
				}

				// Removing a list item.
				if ( entry.type == 'remove' ) {
					const listItem = entry.position.parent;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const formatAttribute = this._getListItemConsistentFormat( model, listItem, formatAttributeName );
					const listItemFormatAttribute = listItem.getAttribute( listItemFormatAttributeName );

					if ( !formatAttribute && listItemFormatAttribute ) {
						this._removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName );
						returnValue = true;
					}
				}

				// Changing an element into a list item.
				if (
					entry.type == 'attribute' &&
					entry.attributeKey == 'listItemId' &&
					entry.attributeOldValue == null
				) {
					const listItem = entry.range.start.nodeAfter;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const formatAttribute = this._getListItemConsistentFormat( model, listItem, formatAttributeName );

					if ( formatAttribute && !listItem.getAttribute( listItemFormatAttributeName ) ) {
						this._addFormattingToListItem( writer, listItem, listItemFormatAttributeName, formatAttribute );
						returnValue = true;
					}

					continue;
				}
			}

			return returnValue;
		} );
	}

	/**
	 * TODO
	 */
	private _removeFormattingFromListItem(
		writer: Writer,
		listItem: Element,
		attributeKey: string
	): void {
		if ( listItem.hasAttribute( attributeKey ) ) {
			writer.removeAttribute( attributeKey, listItem );
		}
	}

	/**
	 * TODO
	 */
	private _getListItemConsistentFormat( model: Model, listItem: Element, attributeKey: string ): string | false | undefined {
		let hasListItemConsistentFormat = false;
		let prevFormatAttribute;

		for ( const child of listItem.getChildren() ) {
			if ( model.schema.checkAttribute( child, attributeKey ) ) {
				const formatAttribute = child.getAttribute( attributeKey ) as string;

				// First child.
				if ( !prevFormatAttribute ) {
					if ( formatAttribute ) {
						prevFormatAttribute = formatAttribute;
						hasListItemConsistentFormat = true;
						continue;
					} else {
						hasListItemConsistentFormat = false;
						break;
					}
				}

				// Second and next children.
				if ( formatAttribute !== prevFormatAttribute ) {
					hasListItemConsistentFormat = false;
					break;
				}
			}
		}

		return hasListItemConsistentFormat && prevFormatAttribute;
	}

	/**
	 * Adds a formatting to the list of loaded formattings.
	 *
	 * @internal
	 */
	public _addFormatting( listItemFormatAttribute: string, formatAttribute: string ): void {
		if ( !this._loadedFormattings[ listItemFormatAttribute ] ) {
			this._loadedFormattings[ listItemFormatAttribute ] = formatAttribute;
		}
	}
}
