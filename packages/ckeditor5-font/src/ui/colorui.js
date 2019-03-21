/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { normalizeOptions, addColorsToDropdown } from '../utils';

/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ColorUI extends Plugin {
	constructor( editor, { commandName, icon, componentName, dropdownLabel } ) {
		super( editor );

		this.commandName = commandName;
		this.icon = icon;
		this.componentName = componentName;
		this.dropdownLabel = dropdownLabel;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( this.commandName );

		const options = this._getLocalizedOptions();

		// Register UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
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
				label: t( this.dropdownLabel ),
				icon: this.icon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-color-ui-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, val ) => {
				if ( val.value !== null ) {
					colorTableView.recentlyUsedColors.add( { color: val.value, hasBorder: val.hasBorder, label: val.label }, 0 );
				}
				editor.execute( this.commandName, val );
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
		const options = normalizeOptions( editor.config.get( `${ this.componentName }.colors` ) );
		options.forEach( option => {
			option.label = t( option.label );
		} );
		return options;
	}
}
