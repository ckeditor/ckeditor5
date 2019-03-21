/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontbackgroundcolor/fontbackgroundolorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { FONT_BACKGROUND_COLOR, normalizeOptions, addColorsToDropdown } from '../utils';
import fontBackgroundColorIcon from '../../theme/icons/font-background.svg';

/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontBackgroundColorUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( FONT_BACKGROUND_COLOR );

		const options = this._getLocalizedOptions();

		// Register UI component.
		editor.ui.componentFactory.add( FONT_BACKGROUND_COLOR, locale => {
			const dropdownView = createDropdown( locale );
			const colorTableView = addColorsToDropdown(
				dropdownView,
				options.map( element => ( {
					label: element.label,
					color: element.model,
					options: {
						hasBorder: element.hasBorder
					}
				} ) )
			);
			colorTableView.set( 'removeButtonTooltip', t( 'Remove color' ) );

			colorTableView.bind( 'selectedColor' ).to( command, 'value' );

			dropdownView.buttonView.set( {
				label: t( 'Font Background Color' ),
				icon: fontBackgroundColorIcon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-font-background-color-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, data ) => {
				if ( data.value !== null ) {
					colorTableView.recentlyUsedColors.add( {
						color: data.value,
						hasBorder: data.hasBorder,
						label: data.label
					}, 0 );
				}
				editor.execute( FONT_BACKGROUND_COLOR, data );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns options as defined in `config.fontBackgroundColor.colors` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontBackgroundColor~FontBackgroundColorOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:font/fontbackgroundcolor~FontBackgroundColorOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;
		const options = normalizeOptions( editor.config.get( `${ FONT_BACKGROUND_COLOR }.colors` ) );
		options.forEach( option => {
			option.label = t( option.label );
		} );
		return options;
	}
}
