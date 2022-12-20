/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colorui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { createDropdown, normalizeColorOptions, getLocalizedColorOptions, focusChildOnDropdownOpen } from 'ckeditor5/src/ui';
import type FontCommand from '../fontcommand';

import { type ColorTableDropdownView, addColorTableToDropdown } from '../utils';
import type ColorTableView from './colortableview';

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:font/ui/colortableview~ColorTableView}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ColorUI extends Plugin {
	/**
	 * The name of the command which will be executed when a color tile is clicked.
	 */
	public commandName: string;

	/**
	 * The name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
	 * Also the configuration scope name in `editor.config`.
	 */
	public componentName: string;

	/**
	 * The SVG icon used by the dropdown.
	 */
	public icon: string;

	/**
	 * The label used by the dropdown.
	 */
	public dropdownLabel: string;

	/**
	 * The number of columns in the color grid.
	 */
	public columns: number;

	/**
	 * Keeps a reference to {@link module:font/ui/colortableview~ColorTableView}.
	 */
	public colorTableView: ColorTableView | undefined;

	/**
	 * Creates a plugin which introduces a dropdown with a pre–configured {@link module:font/ui/colortableview~ColorTableView}.
	 *
	 * @param {Object} config The configuration object.
	 * @param {String} config.commandName The name of the command which will be executed when a color tile is clicked.
	 * @param {String} config.componentName The name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
	 * and the configuration scope name in `editor.config`.
	 * @param {String} config.icon The SVG icon used by the dropdown.
	 * @param {String} config.dropdownLabel The label used by the dropdown.
	 */
	constructor( editor: Editor, { commandName, icon, componentName, dropdownLabel }: any ) {
		super( editor );

		this.commandName = commandName;
		this.componentName = componentName;
		this.icon = icon;
		this.dropdownLabel = dropdownLabel;
		this.columns = editor.config.get( `${ this.componentName }.columns` ) as number;
		this.colorTableView = undefined;
	}

	/**
	* @inheritDoc
	*/
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;
		const command = editor.commands.get( this.commandName ) as FontCommand;
		const colorsConfig = normalizeColorOptions( ( editor.config.get( this.componentName ) as any ).colors );
		const localizedColors = getLocalizedColorOptions( locale, colorsConfig );
		const documentColorsCount = editor.config.get( `${ this.componentName }.documentColors` ) as number | undefined;

		// Register the UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
			const dropdownView: ColorTableDropdownView = createDropdown( locale );
			this.colorTableView = addColorTableToDropdown(
				dropdownView,
				localizedColors.map( option => ( {
					label: option.label,
					color: option.model,
					options: {
						hasBorder: option.hasBorder
					}
				} ) ),
				this.columns,
				t( 'Remove color' ),
				documentColorsCount !== 0 ? t( 'Document colors' ) : '',
				documentColorsCount === undefined ? this.columns : documentColorsCount
			);

			this.colorTableView.bind( 'selectedColor' ).to( command, 'value' );

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

			dropdownView.on( 'change:isOpen', ( evt, name, isVisible ) => {
				// Grids rendering is deferred (#6192).
				dropdownView.colorTableView!.appendGrids();

				if ( isVisible ) {
					if ( documentColorsCount !== 0 ) {
						this.colorTableView!.updateDocumentColors( editor.model, this.componentName );
					}
					this.colorTableView!.updateSelectedColors();
				}
			} );

			// Accessibility: focus the first active color when opening the dropdown.
			focusChildOnDropdownOpen(
				dropdownView,
				() => dropdownView.colorTableView!.staticColorsGrid!.items.find( ( item: any ) => item.isOn )
			);

			return dropdownView;
		} );
	}
}

