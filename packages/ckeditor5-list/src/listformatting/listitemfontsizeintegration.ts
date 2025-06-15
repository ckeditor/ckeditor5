/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemfontsizeintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { ViewElement } from 'ckeditor5/src/engine.js';
import { type FontSizeConfig } from '@ckeditor/ckeditor5-font';

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

		const fontSizeConfig: FontSizeConfig = editor.config.get( 'fontSize' )!;
		const isFontSizeConfigNumeric = checkIsFontSizeConfigNumeric( fontSizeConfig );
		const namedPresets = getNamedPresetsFromConfig( fontSizeConfig, isFontSizeConfigNumeric );

		ListFormatting.registerFormatAttribute( 'listItemFontSize', 'fontSize' );

		// Register the downcast strategy in init() so that the attribute name is registered  before the list editing
		// registers its converters.
		// This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemFontSize',

			setAttributeOnDowncast( writer, value: string, viewElement ) {
				if ( value ) {
					if ( isFontSizeConfigNumeric ) {
						writer.setStyle( 'font-size', value as string, viewElement );
					}
					else if ( namedPresets.includes( value ) ) {
						writer.addClass( `text-${ value }`, viewElement );
					}
				} else {
					if ( isFontSizeConfigNumeric ) {
						writer.removeStyle( 'font-size', viewElement );
					} else {
						for ( const preset of namedPresets ) {
							writer.removeClass( `text-${ preset }`, viewElement );
						}
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

		const fontSizeConfig: FontSizeConfig = editor.config.get( 'fontSize' )!;
		const isFontSizeConfigNumeric = checkIsFontSizeConfigNumeric( fontSizeConfig );
		const namedPresets = getNamedPresetsFromConfig( editor.config.get( 'fontSize' )!, isFontSizeConfigNumeric );

		if ( isFontSizeConfigNumeric ) {
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
						'font-size': /.*/
					}
				}
			} );
		} else {
			editor.conversion.for( 'upcast' ).attributeToAttribute( {
				model: {
					key: 'listItemFontSize',
					value: ( viewElement: ViewElement ) => {
						const className = [ ...viewElement.getClassNames() ].find( className => {
							return className.startsWith( 'text-' );
						} );

						return className!.replace( /^text-/, '' );
					}
				},
				view: {
					key: 'class',
					name: 'li',
					value: new RegExp( `^text-(${ namedPresets.join( '|' ) })$` )
				}
			} );
		}
	}
}

/**
 * Checks if the font size configuration is numeric (not using named presets).
 */
function checkIsFontSizeConfigNumeric( fontSizeConfig: FontSizeConfig ): boolean {
	return fontSizeConfig.options!.some( option => {
		return typeof option === 'number';
	} );
}

/**
 * Returns an array of named presets from the font size configuration if it's not a numeric configuration.
 */
function getNamedPresetsFromConfig( fontSizeConfig: FontSizeConfig, isFontSizeConfigNumeric: boolean ): Array<string> {
	return isFontSizeConfigNumeric ? [] : [ 'tiny', 'small', 'big', 'huge' ].filter( preset => {
		return fontSizeConfig.options!.includes( preset );
	} );
}
