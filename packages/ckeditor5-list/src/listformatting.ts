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
				if ( !( entry.type == 'attribute' ) || !( entry.attributeKey == 'fontFamily' ) ) {
					continue;
				}

				const parent = entry.range.start.parent;

				if ( !isListItemBlock( parent ) ) {
					continue;
				}

				const fontFamily = entry.attributeNewValue as string | null;
				const listItemFontFamily = parent.getAttribute( 'listItemFontFamily' );

				if ( fontFamily ) {
					if ( this._isListItemConsistentlyFormatted( model, parent, 'fontFamily' ) ) {
						if ( listItemFontFamily !== fontFamily ) {
							this._addFormattingToListItem( writer, parent, 'listItemFontFamily', fontFamily );
							returnValue = true;
						}
					} else if ( listItemFontFamily ) {
						this._removeFormattingFromListItem( writer, parent, 'listItemFontFamily' );
						returnValue = true;
					}
				} else if ( listItemFontFamily ) {
					this._removeFormattingFromListItem( writer, parent, 'listItemFontFamily' );
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
	private _isListItemConsistentlyFormatted( model: Model, listItem: Element, attributeKey: string ): boolean {
		let hasListItemConsistentFormat = false;
		let prevFontFamily;

		for ( const child of listItem.getChildren() ) {
			if ( model.schema.checkAttribute( child, attributeKey ) ) {
				const fontFamily = child.getAttribute( attributeKey );

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

		return hasListItemConsistentFormat;
	}
}
