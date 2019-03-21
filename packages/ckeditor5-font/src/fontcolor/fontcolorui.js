/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { FONT_COLOR, normalizeOptions, addColorsToDropdown } from '../utils';
import fontColorIcon from '../../theme/icons/font-color.svg';

/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontColorUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( FONT_COLOR );

		const options = this._getLocalizedOptions();

		// Register UI component.
		editor.ui.componentFactory.add( FONT_COLOR, locale => {
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
				label: t( 'Font Color' ),
				icon: fontColorIcon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-font-color-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, val ) => {
				if ( val.value !== null ) {
					colorTableView.recentlyUsedColors.add( { color: val.value, hasBorder: val.hasBorder, label: val.label }, 0 );
				}
				editor.execute( FONT_COLOR, val );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns options as defined in `config.fontColor.colors` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontColor~FontColorOption}
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
		const options = normalizeOptions( editor.config.get( `${ FONT_COLOR }.colors` ) );
		options.forEach( option => {
			option.label = t( option.label );
		} );
		return options;
	}
}
