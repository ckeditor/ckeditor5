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

		if ( !editor.plugins.has( 'FontSizeEditing' ) ) {
			return;
		}

		const normalizedFontSizeOptions = _normalizeFontSizeOptions( editor.config.get( 'fontSize.options' )! );

		ListFormatting.registerFormatAttribute( 'fontSize', 'listItemFontSize' );

		// Register the downcast strategy in init() so that the attribute name is registered  before the list editing
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
							writer.addClass( 'ck-list-marker-font-size', viewElement );
							writer.setStyle( '--ck-content-list-marker-font-size', fontSizeOption.view.styles[ 'font-size' ], viewElement );
						}
						else if ( fontSizeOption.view.classes ) {
							writer.addClass( `ck-list-marker-font-size-${ value }`, viewElement );
						}
					} else {
						writer.addClass( 'ck-list-marker-font-size', viewElement );
						writer.setStyle( '--ck-content-list-marker-font-size', value as string, viewElement );
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

		if ( !editor.plugins.has( 'FontSizeEditing' ) ) {
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

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: 'listItemFontSize',
				value: ( viewElement: ViewElement ) => viewElement.getStyle( '--ck-content-list-marker-font-size' )
			},
			view: {
				name: 'li',
				classes: 'ck-list-marker-font-size',
				styles: {
					'--ck-content-list-marker-font-size': /.*/
				}
			}
		} );

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
						classes: `ck-list-marker-font-size-${ option.model }`
					}
				} );
			}
		}
	}
}
