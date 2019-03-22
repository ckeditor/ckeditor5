/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { normalizeOptions, addColorsToDropdown } from '../utils';

/**
 * The color UI plugin. It's template for creating the `'fontBackgroundColor'` and the `'fotnColor'` dropdown.
 * Plugin separates common logic responsible for displaying dropdown with color grids.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ColorUI extends Plugin {
	/**
	 * Creates plugin which adds UI with {@link module:font/ui/colortableview~ColorTableView} with proper configuration.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Object} config Configuration object
	 * @param {String} config.commandName Name of command which will be execute after click into selected color tile.config.
	 * @param {String} config.componentName Name of this component in {@link module:ui/componentfactory~ComponentFactory}
	 * @param {String} config.icon SVG icon used in toolbar for displaying this UI element.
	 * @param {String} config.dropdownLabel Label used for icon in toolbar for this element.
	 */
	constructor( editor, { commandName, icon, componentName, dropdownLabel } ) {
		super( editor );

		/**
		 * Name of command which will be execute after click into selected color tile.config.
		 * @type {String}
		 */
		this.commandName = commandName;

		/**
		 * Name of this component in {@link module:ui/componentfactory~ComponentFactory}.
		 * @type {String}
		 */
		this.componentName = componentName;

		/**
		 * SVG icon used in toolbar for displaying this UI element.
		 * @type {String}
		 */
		this.icon = icon;

		/**
		 * Label used for icon in toolbar for this element.
		 * @type {String}
		 */
		this.dropdownLabel = dropdownLabel;

		/**
		 * Number of columns in color grid. Determines how many recent color will be displayed.
		 * @type {Number}
		 */
		this.colorColumns = editor.config.get( `${ this.componentName }.columns` );
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
			const colorTableView = addColorsToDropdown( {
				dropdownView,
				colors: options.map( element => ( {
					label: element.label,
					color: element.model,
					options: {
						hasBorder: element.hasBorder
					}
				} ) ),
				colorColumns: this.colorColumns,
				removeButtonTooltip: t( 'Remove color' )
			} );

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
	 * Returns options as defined in `config` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontcolor~FontColorConfig}
	 * or {@link module:font/fontbackgroundcolor~FontBackgroundColorConfig} in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:font/fontbackgroundcolor~FontBackgroundColorConfig>|Array.<module:font/fontcolor~FontColorConfig>}.
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
