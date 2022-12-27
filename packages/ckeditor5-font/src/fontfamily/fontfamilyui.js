/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily/fontfamilyui
 */

import { Plugin } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
import { Model, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';

import { normalizeOptions } from './utils';
import { FONT_FAMILY } from '../utils';

import fontFamilyIcon from '../../theme/icons/font-family.svg';

/**
 * The font family UI plugin. It introduces the `'fontFamily'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamilyUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontFamilyUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		const options = this._getLocalizedOptions();

		const command = editor.commands.get( FONT_FAMILY );

		// Register UI component.
		editor.ui.componentFactory.add( FONT_FAMILY, locale => {
			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, _prepareListOptions( options, command ) );

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
				editor.execute( evt.source.commandName, { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns options as defined in `config.fontFamily.options` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontfamily~FontFamilyOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:font/fontfamily~FontFamilyOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;

		const options = normalizeOptions( editor.config.get( FONT_FAMILY ).options );

		return options.map( option => {
			// The only title to localize is "Default" others are font names.
			if ( option.title === 'Default' ) {
				option.title = t( 'Default' );
			}

			return option;
		} );
	}
}

// Prepares FontFamily dropdown items.
// @private
// @param {Array.<module:font/fontsize~FontSizeOption>} options
// @param {module:font/fontsize/fontsizecommand~FontSizeCommand} command
function _prepareListOptions( options, command ) {
	const itemDefinitions = new Collection();

	// Create dropdown items.
	for ( const option of options ) {
		const def = {
			type: 'button',
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
		if ( option.view && option.view.styles ) {
			def.model.set( 'labelStyle', `font-family: ${ option.view.styles[ 'font-family' ] }` );
		}

		itemDefinitions.add( def );
	}
	return itemDefinitions;
}
