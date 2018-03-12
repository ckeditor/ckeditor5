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

import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { normalizeOptions } from '../fontsize/utils';

import fontSizeIcon from '../../theme/icons/font-size.svg';
import '../../theme/fontsize.css';

/**
 * The font family UI plugin. It introduces the `'fontSize'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		const options = this._getLocalizedOptions();

		const command = editor.commands.get( 'fontSize' );

		// Register UI component.
		editor.ui.componentFactory.add( 'fontSize', locale => {
			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, _prepareListOptions( options, command ) );

			// Create dropdown model.
			dropdownView.buttonView.set( {
				label: t( 'Font Size' ),
				icon: fontSizeIcon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-font-size-dropdown'
					]
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
			Default: t( 'Default' ),
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

// Prepares FontSize dropdown items.
// @private
// @param {Array.<module:font/fontsize~FontSizeOption>} options
// @param {module:font/fontsize/fontsizecommand~FontSizeCommand} command
function _prepareListOptions( options, command ) {
	const dropdownItems = new Collection();

	for ( const option of options ) {
		const itemModel = new Model( {
			commandName: 'fontSize',
			commandParam: option.model,
			label: option.title,
			class: 'ck-fontsize-option'
		} );

		if ( option.view && option.view.style ) {
			itemModel.set( 'style', `font-size:${ option.view.style[ 'font-size' ] }` );
		}

		if ( option.view && option.view.class ) {
			itemModel.set( 'class', `${ itemModel.class } ${ option.view.class }` );
		}

		itemModel.bind( 'isActive' ).to( command, 'value', value => value === option.model );

		// Add the option to the collection.
		dropdownItems.add( itemModel );
	}

	return dropdownItems;
}
