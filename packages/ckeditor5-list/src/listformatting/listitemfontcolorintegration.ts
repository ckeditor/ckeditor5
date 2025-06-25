/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemfontcolorintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { type ViewElement } from 'ckeditor5/src/engine.js';

import ListEditing from '../list/listediting.js';
import type ListFormatting from '../listformatting.js';

/**
 * The list item font color integration plugin.
 */
export default class ListItemFontColorIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemFontColorIntegration' as const;
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

		if ( !editor.plugins.has( 'FontColorEditing' ) ) {
			return;
		}

		ListFormatting.registerFormatAttribute( 'fontColor', 'listItemFontColor' );

		// Register the downcast strategy in init() so that the attribute name is registered  before the list editing
		// registers its converters.
		// This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemFontColor',

			setAttributeOnDowncast( writer, value, viewElement ) {
				if ( value ) {
					writer.addClass( 'ck-list-marker-color', viewElement );
					writer.setStyle( '--ck-content-list-marker-color', value as string, viewElement );
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

		if ( !editor.plugins.has( 'FontColorEditing' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemFontColor' } );
		model.schema.setAttributeProperties( 'listItemFontColor', {
			isFormatting: true
		} );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'listItemFontColor' );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: {
				key: 'listItemFontColor',
				value: ( viewElement: ViewElement ) => {
					return viewElement.getStyle( '--ck-content-list-marker-color' );
				}
			},
			view: {
				name: 'li',
				classes: 'ck-list-marker-color',
				styles: {
					'--ck-content-list-marker-color': /.*/
				}
			}
		} );
	}
}
