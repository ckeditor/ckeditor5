/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemfontsizeintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { ElementObjectDefinition, ViewElement } from 'ckeditor5/src/engine.js';
import { _normalizeFontSizeOptions } from '@ckeditor/ckeditor5-font';

import ListEditing from '../list/listediting.js';
import type ListFormatting from '../listformatting.js';

/**
 * The list item font size integration plugin.
 */
export default class ListItemFontSizeIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemFontSizeIntegration' as const;
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

		if ( !editor.plugins.has( 'FontSizeEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		const normalizedFontSizeOptions = _normalizeFontSizeOptions( editor.config.get( 'fontSize.options' )! );

		ListFormatting.registerFormatAttribute( 'fontSize', 'listItemFontSize' );

		// Register the downcast strategy in init() so that the attribute name is registered before the list editing
		// registers its converters.
		// This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemFontSize',

			setAttributeOnDowncast( writer, value: string, viewElement ) {
				if ( value ) {
					const fontSizeOption = normalizedFontSizeOptions.find( option => option.model == value );

					if ( fontSizeOption && fontSizeOption.view && typeof fontSizeOption.view != 'string' ) {
						if ( fontSizeOption.view.styles ) {
							writer.setStyle( fontSizeOption.view.styles, viewElement );
						}
						else if ( fontSizeOption.view.classes ) {
							writer.addClass( fontSizeOption.view.classes, viewElement );
						}
					} else {
						writer.setStyle( 'font-size', value as string, viewElement );
					}
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

		if ( !editor.plugins.has( 'FontSizeEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemFontSize' } );
		model.schema.setAttributeProperties( 'listItemFontSize', {
			isFormatting: true
		} );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'listItemFontSize' );

		const supportAllValues = editor.config.get( 'fontSize.supportAllValues' );

		// If the `supportAllValues` is set to `true`, we allow any value (in pixels) for the font size attribute.
		if ( supportAllValues ) {
			editor.conversion.for( 'upcast' ).elementToAttribute( {
				model: {
					key: 'listItemFontSize',
					value: ( viewElement: ViewElement ) => viewElement.getStyle( 'font-size' )
				},
				view: {
					name: 'li',
					styles: {
						'font-size': /.*/
					}
				}
			} );
		} else {
			const fontSizeOptions = _normalizeFontSizeOptions( editor.config.get( 'fontSize.options' )! );

			for ( const option of fontSizeOptions ) {
				if ( option.model && option.view ) {
					const view = option.view as ElementObjectDefinition;

					editor.conversion.for( 'upcast' ).elementToAttribute( {
						model: {
							key: 'listItemFontSize',
							value: option.model
						},
						view: {
							name: 'li',
							...( view.styles ? { styles: view.styles } : {} ),
							...( view.classes ? { classes: view.classes } : {} )
						}
					} );
				}
			}
		}
	}
}
