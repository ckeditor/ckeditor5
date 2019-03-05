/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import fontColorIcon from '../../theme/icons/font-family.svg';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { normalizeOptions } from './utils';
import InsertColorView from '../ui/insertcolorview';

export default class FontColorUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'fontColor' );

		const options = this._getLocalizedOptions();

		// Register UI component.
		editor.ui.componentFactory.add( 'fontColor', locale => {
			const dropdownView = createDropdown( locale );

			const insertColorView = new InsertColorView( locale, options );
			dropdownView.panelView.children.add( insertColorView );

			insertColorView.delegate( 'execute' ).to( dropdownView );

			dropdownView.buttonView.set( {
				label: t( 'Font Color' ),
				icon: fontColorIcon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-font-family-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, val ) => {
				editor.execute( 'fontColor', val );
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
		const options = normalizeOptions( editor.config.get( 'fontColor.options' ) );

		return options;
	}
}
