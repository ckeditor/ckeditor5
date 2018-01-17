/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';

import fontFamilyIcon from '../../theme/icons/font-family.svg';
import { normalizeOptions } from './utils';

/**
 * @extends module:core/plugin~Plugin
 */
export default class FontFamilyUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		const dropdownItems = new Collection();

		const options = this._getLocalizedOptions();

		const command = editor.commands.get( 'fontFamily' );

		// Create dropdown items.
		for ( const option of options ) {
			const itemModel = new Model( {
				commandName: 'fontFamily',
				commandParam: option.model,
				label: option.title
			} );

			itemModel.bind( 'isActive' ).to( command, 'value', value => value === option.model );

			// Try to set a dropdown list item style.
			if ( option.view && option.view.style ) {
				itemModel.set( 'style', `font-family: ${ option.view.style[ 'font-family' ] }` );
			}

			dropdownItems.add( itemModel );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			icon: fontFamilyIcon,
			withText: false,
			items: dropdownItems,
			tooltip: t( 'Font Family' )
		} );

		dropdownModel.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Register UI component.
		editor.ui.componentFactory.add( 'fontFamily', locale => {
			const dropdown = createListDropdown( dropdownModel, locale );

			dropdown.extendTemplate( {
				attributes: {
					class: [
						'ck-font-family-dropdown'
					]
				}
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', evt => {
				editor.execute( evt.source.commandName, { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}

	/**
	 * Returns options as defined in `config.fontFamily.options` but processed to consider
	 * editor localization, i.e. to display {@link module:font/fontfamily/fontfamilyediting~FontFamilyOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:font/fontfamily/fontfamilyediting~FontFamilyOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;

		const options = normalizeOptions( editor.config.get( 'fontFamily.options' ) );

		return options.map( option => {
			// The only title to localize is "Default" others are font names.
			if ( option.title === 'Default' ) {
				option.title = t( 'Default' );
			}

			return option;
		} );
	}
}
