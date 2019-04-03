/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import {
	addColorTableToDropdown,
	normalizeColorOptions,
	getLocalizedColorOptions
} from '../utils';

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and the `'fontColor'` dropdowns, each hosting
 * a {@link module:font/ui/colortableview~ColorTableView}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ColorUI extends Plugin {
	/**
	 * Creates a plugin which brings dropdown with a pre–configured {@link module:font/ui/colortableview~ColorTableView}
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Object} config Configuration object
	 * @param {String} config.commandName Name of command which will be executed when a color tile is clicked.
	 * @param {String} config.componentName Name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
	 * and the configuration scope name in `editor.config`.
	 * @param {String} config.icon SVG icon used by the dropdown.
	 * @param {String} config.dropdownLabel Label used by the dropdown.
	 */
	constructor( editor, { commandName, icon, componentName, dropdownLabel } ) {
		super( editor );

		/**
		 * Name of the command which will be executed when a color tile is clicked.
		 * @type {String}
		 */
		this.commandName = commandName;

		/**
		 * Name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
		 * Also the configuration scope name in `editor.config`.
		 * @type {String}
		 */
		this.componentName = componentName;

		/**
		 * SVG icon used by the dropdown.
		 * @type {String}
		 */
		this.icon = icon;

		/**
		 * Label used by the dropdown.
		 * @type {String}
		 */
		this.dropdownLabel = dropdownLabel;

		/**
		 * Number of columns in color grid.
		 * @type {Number}
		 */
		this.columns = editor.config.get( `${ this.componentName }.columns` );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( this.commandName );
		const colorsConfig = normalizeColorOptions( editor.config.get( this.componentName ).colors );
		const localizedColors = getLocalizedColorOptions( editor, colorsConfig );

		// Register UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
			const dropdownView = createDropdown( locale );
			const colorTableView = addColorTableToDropdown( {
				dropdownView,
				colors: localizedColors.map( option => ( {
					label: option.label,
					color: option.model,
					options: {
						hasBorder: option.hasBorder
					}
				} ) ),
				columns: this.columns,
				removeButtonLabel: t( 'Remove color' )
			} );

			colorTableView.bind( 'selectedColor' ).to( command, 'value' );

			dropdownView.buttonView.set( {
				label: this.dropdownLabel,
				icon: this.icon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-color-ui-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( this.commandName, data );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}
