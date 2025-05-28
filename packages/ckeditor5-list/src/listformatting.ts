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
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		// const listEditing: ListEditing = editor.plugins.get( ListEditing );

		model.document.registerPostFixer( writer => {
			const changes = editor.model.document.differ.getChanges();
			let returnValue = false;

			for ( const entry of changes ) {
				// Changing format on text inside a list item.
				if ( entry.type == 'attribute' && entry.attributeKey == 'fontFamily' ) {
					const listItem = entry.range.start.parent;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const fontFamily = entry.attributeNewValue as string | null;
					const listItemFontFamily = listItem.getAttribute( 'listItemFontFamily' );

					if ( fontFamily ) {
						if ( this._getListItemConsistentFormat( model, listItem, 'fontFamily' ) ) {
							if ( listItemFontFamily !== fontFamily ) {
								this._addFormattingToListItem( writer, listItem, 'listItemFontFamily', fontFamily );
								returnValue = true;
							}
						} else if ( listItemFontFamily ) {
							this._removeFormattingFromListItem( writer, listItem, 'listItemFontFamily' );
							returnValue = true;
						}
					} else if ( listItemFontFamily ) {
						this._removeFormattingFromListItem( writer, listItem, 'listItemFontFamily' );
						returnValue = true;
					}

					continue;
				}

				// Inserting a text node to a list item.
				if ( entry.type == 'insert' && entry.name == '$text' ) {
					// Inserting a text node.
					const listItem = entry.position.parent;

					if ( !isListItemBlock( listItem ) ) {
						continue;
					}

					const fontFamily = this._getListItemConsistentFormat( model, listItem, 'fontFamily' );
					const listItemFontFamily = listItem.getAttribute( 'listItemFontFamily' );

					if ( fontFamily ) {
						if ( listItemFontFamily != fontFamily ) {
							this._addFormattingToListItem( writer, listItem, 'listItemFontFamily', fontFamily );
							returnValue = true;
						} else {
							continue;
						}
					} else {
						if ( listItem.hasAttribute( 'listItemFontFamily' ) ) {
							this._removeFormattingFromListItem( writer, listItem, 'listItemFontFamily' );
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

					const fontFamily = this._getListItemConsistentFormat( model, listItem, 'fontFamily' );
					const listItemFontFamily = listItem.getAttribute( 'listItemFontFamily' );

					if ( fontFamily ) {
						if ( listItemFontFamily != fontFamily ) {
							this._addFormattingToListItem( writer, listItem, 'listItemFontFamily', fontFamily );
							returnValue = true;
						} else {
							continue;
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

					const fontFamily = this._getListItemConsistentFormat( model, listItem, 'fontFamily' );

					if ( fontFamily && !listItem.getAttribute( 'listItemFontFamily' ) ) {
						this._addFormattingToListItem( writer, listItem, 'listItemFontFamily', fontFamily );
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

					const fontFamily = this._getListItemConsistentFormat( model, listItem, 'fontFamily' );
					const listItemFontFamily = listItem.getAttribute( 'listItemFontFamily' );

					if ( !fontFamily && listItemFontFamily ) {
						this._removeFormattingFromListItem( writer, listItem, 'listItemFontFamily' );
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

					const fontFamily = this._getListItemConsistentFormat( model, listItem, 'fontFamily' );

					if ( fontFamily && !listItem.getAttribute( 'listItemFontFamily' ) ) {
						this._addFormattingToListItem( writer, listItem, 'listItemFontFamily', fontFamily );
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
		let prevFontFamily;

		for ( const child of listItem.getChildren() ) {
			if ( model.schema.checkAttribute( child, attributeKey ) ) {
				const fontFamily = child.getAttribute( attributeKey ) as string;

				// First child.
				if ( !prevFontFamily ) {
					if ( fontFamily ) {
						prevFontFamily = fontFamily;
						hasListItemConsistentFormat = true;
						continue;
					} else {
						hasListItemConsistentFormat = false;
						break;
					}
				}

				// Second and next children.
				if ( fontFamily !== prevFontFamily ) {
					hasListItemConsistentFormat = false;
					break;
				}
			}
		}

		return hasListItemConsistentFormat && prevFontFamily;
	}
}
