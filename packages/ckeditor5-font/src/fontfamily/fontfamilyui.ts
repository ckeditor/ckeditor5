/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily/fontfamilyui
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import { Model, createDropdown, addListToDropdown, type ListDropdownItemDefinition } from 'ckeditor5/src/ui';

import { normalizeOptions } from './utils';
import { FONT_FAMILY } from '../utils';

import type { FontFamilyOption } from '../fontconfig';
import type FontFamilyCommand from './fontfamilycommand';

import fontFamilyIcon from '../../theme/icons/font-family.svg';

/**
 * The font family UI plugin. It introduces the `'fontFamily'` dropdown.
 */
export default class FontFamilyUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FontFamilyUI' {
		return 'FontFamilyUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		const options = this._getLocalizedOptions();

		const command: FontFamilyCommand = editor.commands.get( FONT_FAMILY )!;

		// Register UI component.
		editor.ui.componentFactory.add( FONT_FAMILY, locale => {
			const dropdownView = createDropdown( locale );

			addListToDropdown( dropdownView, () => _prepareListOptions( options, command ) );

			dropdownView.buttonView.set( {
				label: t( 'Font Family' ),
				icon: fontFamilyIcon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-font-family-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( ( evt.source as any ).commandName, { value: ( evt.source as any ).commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns options as defined in `config.fontFamily.options` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontconfig~FontFamilyOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 */
	private _getLocalizedOptions(): Array<FontFamilyOption> {
		const editor = this.editor;
		const t = editor.t;

		const options = normalizeOptions( ( editor.config.get( FONT_FAMILY )! ).options! );

		return options.map( option => {
			// The only title to localize is "Default" others are font names.
			if ( option.title === 'Default' ) {
				option.title = t( 'Default' );
			}

			return option;
		} );
	}
}

/**
 * Prepares FontFamily dropdown items.
 */
function _prepareListOptions( options: Array<FontFamilyOption>, command: FontFamilyCommand ): Collection<ListDropdownItemDefinition> {
	const itemDefinitions = new Collection<ListDropdownItemDefinition>();

	// Create dropdown items.
	for ( const option of options ) {
		const def = {
			type: 'button' as const,
			model: new Model( {
				commandName: FONT_FAMILY,
				commandParam: option.model,
				label: option.title,
				withText: true
			} )
		};

		def.model.bind( 'isOn' ).to( command, 'value', value => {
			// "Default" or check in strict font-family converters mode.
			if ( value === option.model ) {
				return true;
			}

			if ( !value || !option.model ) {
				return false;
			}

			return value.split( ',' )[ 0 ].replace( /'/g, '' ).toLowerCase() === option.model.toLowerCase();
		} );

		// Try to set a dropdown list item style.
		if ( option.view && typeof option.view !== 'string' && option.view.styles ) {
			def.model.set( 'labelStyle', `font-family: ${ option.view.styles[ 'font-family' ] }` );
		}

		itemDefinitions.add( def );
	}
	return itemDefinitions;
}
