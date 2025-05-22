/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemfontfamilyintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { type ViewElement } from 'ckeditor5/src/engine.js';

import ListEditing from '../list/listediting.js';

/**
 * The list item font family integration plugin.
 */
export default class ListItemFontFamilyIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemFontFamilyIntegration' as const;
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
		return [ ListEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const model = editor.model;
		const listEditing: ListEditing = editor.plugins.get( 'ListEditing' );

		if ( !editor.plugins.has( 'FontFamilyEditing' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemFontFamily' } );
		model.schema.setAttributeProperties( 'listItemFontFamily', {
			isFormatting: true
		} );

		model.schema.addAttributeCheck( ( context, attributeName ) => {
			const item = context.last;

			if ( attributeName != 'listItemFontFamily' ) {
				return;
			}

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemFontFamily',

			setAttributeOnDowncast( writer, value, viewElement ) {
				if ( value ) {
					writer.setStyle( 'font-family', value as string, viewElement );
				} else {
					writer.removeStyle( 'font-family', viewElement );
				}
			}
		} );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: {
				key: 'listItemFontFamily',
				value: ( viewElement: ViewElement ) => {
					return viewElement.getStyle( 'font-family' );
				}
			},
			view: {
				name: 'li',
				styles: {
					'font-family': /.*/
				}
			}
		} );
	}
}
