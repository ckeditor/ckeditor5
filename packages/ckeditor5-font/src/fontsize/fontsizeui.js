/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize/fontsizeui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';

import { normalizeOptions } from '../fontsize/utils';
import fontSizeIcon from '../../theme/icons/font-size.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dropdownItems = new Collection();

		const options = this._getLocalizedOptions();
		const t = editor.t;

		const command = editor.commands.get( 'fontSize' );

		for ( const option of options ) {
			const itemModel = new Model( {
				commandName: 'fontSize',
				commandParam: option.model,
				label: option.title,
				class: option.class
			} );

			itemModel.bind( 'isActive' ).to( command, 'value', value => value === option.model );

			// Add the option to the collection.
			dropdownItems.add( itemModel );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			icon: fontSizeIcon,
			withText: false,
			items: dropdownItems,
			tooltip: t( 'Font Size' )
		} );

		dropdownModel.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Register UI component.
		editor.ui.componentFactory.add( 'fontSize', locale => {
			const dropdown = createListDropdown( dropdownModel, locale );

			dropdown.extendTemplate( {
				attributes: {
					class: [
						'ck-font-size-dropdown'
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
	 * Returns options as defined in `config.fontSize.options` but processed to consider
	 * editor localization, i.e. to display {@link module:font/fontsize~FontSizeOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:font/fontsize~FontSizeOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;

		const localizedTitles = {
			Normal: t( 'Normal' ),
			Tiny: t( 'Tiny' ),
			Small: t( 'Small' ),
			Big: t( 'Big' ),
			Huge: t( 'Huge' )
		};

		const options = normalizeOptions( editor.config.get( 'fontSize.options' ) );

		return options.map( option => {
			const title = localizedTitles[ option.title ];

			if ( title && title != option.title ) {
				// Clone the option to avoid altering the original `namedPresets` from `./utils.js`.
				option = Object.assign( {}, option, { title } );
			}

			return option;
		} );
	}
}
