/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemfontsizeintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { ViewElement } from 'ckeditor5/src/engine.js';
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

		ListFormatting.registerFormatAttribute( 'listItemFontSize', 'fontSize' );

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
							writer.setStyle( 'font-size', value as string, viewElement );
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

		const supportAllValues = editor.config.get( 'fontSize.supportAllValues' );
		const fontSizeOptions = _normalizeFontSizeOptions( editor.config.get( 'fontSize.options' )! );

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
			// List of classes used in the font size options, e.g. `text-small`, `text-big`.
			const classes = fontSizeOptions.flatMap( option => {
				if (
					option.view &&
					typeof option.view !== 'string' &&
					typeof option.view.classes === 'string'
				) {
					return [ option.view.classes ];
				}
				return [];
			} );
			const classToModelMap = new Map();

			// Create a map of class names to model attributes, e.g. `text-small` -> `small`.
			classes.forEach( className => {
				classToModelMap.set( className, className.replace( /^text-/, '' ) );
			} );

			// List of font-size styles used in the font size options, e.g. `14px`, `16px`.
			const styles = fontSizeOptions.flatMap( option => {
				if (
					option.view &&
					typeof option.view !== 'string' &&
					typeof option.view.styles === 'object' &&
					option.view.styles[ 'font-size' ]
				) {
					return [ option.view.styles[ 'font-size' ] ];
				}
				return [];
			} );

			// Convert classes to model attributes, e.g. `text-small` -> `small`.
			editor.conversion.for( 'upcast' ).elementToAttribute( {
				model: {
					key: 'listItemFontSize',
					value: ( viewElement: ViewElement ) => {
						const classNames = [ ...viewElement.getClassNames() ];
						const fontSizeClass = classNames.find( className => classToModelMap.has( className ) );

						return classToModelMap.get( fontSizeClass );
					}
				},
				view: {
					name: 'li',
					classes: new RegExp( `^(${ classes.join( '|' ) })$` )
				}
			} );

			// Apart from classes, we also support inline styles for font size, e.g. `style="font-size: 16px;"`.
			editor.conversion.for( 'upcast' ).attributeToAttribute( {
				model: {
					key: 'listItemFontSize',
					value: ( viewElement: ViewElement ) => {
						return viewElement.getStyle( 'font-size' );
					}
				},
				view: {
					name: 'li',
					styles: {
						'font-size': new RegExp( `^(${ styles.join( '|' ) })$` )
					}
				}
			} );
		}
	}
}
