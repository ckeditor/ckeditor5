/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemfontfamilyintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { type ViewElement } from 'ckeditor5/src/engine.js';

import { ListEditing } from '../list/listediting.js';
import type { ListFormatting } from '../listformatting.js';

/**
 * The list item font family integration plugin.
 */
export class ListItemFontFamilyIntegration extends Plugin {
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
	public init(): void {
		const editor = this.editor;
		const ListFormatting: ListFormatting = editor.plugins.get( 'ListFormatting' );
		const listEditing = editor.plugins.get( ListEditing );

		if ( !editor.plugins.has( 'FontFamilyEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		ListFormatting.registerFormatAttribute( 'fontFamily', 'listItemFontFamily' );

		// Register the downcast strategy in init() so that the attribute name is registered before the list editing
		// registers its converters.
		// This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemFontFamily',

			setAttributeOnDowncast( writer, value, viewElement ) {
				// There is no need of removing the style because downcast strategies handles it automatically.
				if ( value ) {
					writer.addClass( 'ck-list-marker-font-family', viewElement );
					writer.setStyle( '--ck-content-list-marker-font-family', value as string, viewElement );
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const model = editor.model;

		if ( !editor.plugins.has( 'FontFamilyEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemFontFamily' } );
		model.schema.setAttributeProperties( 'listItemFontFamily', {
			isFormatting: true
		} );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'listItemFontFamily' );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: {
				key: 'listItemFontFamily',
				value: ( viewElement: ViewElement ) => {
					return viewElement.getStyle( '--ck-content-list-marker-font-family' );
				}
			},
			view: {
				name: 'li',
				classes: 'ck-list-marker-font-family',
				styles: {
					'--ck-content-list-marker-font-family': /.*/
				}
			}
		} );
	}
}
