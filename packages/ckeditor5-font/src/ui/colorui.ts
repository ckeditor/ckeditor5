/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colorui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { createDropdown, normalizeColorOptions, getLocalizedColorOptions, focusChildOnDropdownOpen } from 'ckeditor5/src/ui';

import {
	addColorTableToDropdown,
	type ColorTableDropdownView,
	type FONT_BACKGROUND_COLOR,
	type FONT_COLOR
} from '../utils';
import type ColorTableView from './colortableview';
import type FontColorCommand from '../fontcolor/fontcolorcommand';
import type FontBackgroundColorCommand from '../fontbackgroundcolor/fontbackgroundcolorcommand';

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:font/ui/colortableview~ColorTableView}.
 */
export default class ColorUI extends Plugin {
	/**
	 * The name of the command which will be executed when a color tile is clicked.
	 */
	public commandName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;

	/**
	 * The name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
	 * Also the configuration scope name in `editor.config`.
	 */
	public componentName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;

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
	 * @param config The configuration object.
	 * @param config.commandName The name of the command which will be executed when a color tile is clicked.
	 * @param config.componentName The name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
	 * and the configuration scope name in `editor.config`.
	 * @param config.icon The SVG icon used by the dropdown.
	 * @param config.dropdownLabel The label used by the dropdown.
	 */
	constructor(
		editor: Editor,
		{ commandName, componentName, icon, dropdownLabel }: {
			commandName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
			componentName: typeof FONT_BACKGROUND_COLOR | typeof FONT_COLOR;
			icon: string;
			dropdownLabel: string;
		}
	) {
		super( editor );

		this.commandName = commandName;
		this.componentName = componentName;
		this.icon = icon;
		this.dropdownLabel = dropdownLabel;
		this.columns = editor.config.get( `${ this.componentName }.columns` )!;
		this.colorTableView = undefined;
	}

	/**
	* @inheritDoc
	*/
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;
		const command: FontColorCommand | FontBackgroundColorCommand = editor.commands.get( this.commandName )!;
		const colorsConfig = normalizeColorOptions( ( editor.config.get( this.componentName )! ).colors! );
		const localizedColors = getLocalizedColorOptions( locale, colorsConfig );
		const documentColorsCount = editor.config.get( `${ this.componentName }.documentColors` )!;

		// Register the UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
			const dropdownView: ColorTableDropdownView = createDropdown( locale );

			this.colorTableView = addColorTableToDropdown( {
				dropdownView,
				colors: localizedColors.map( option => ( {
					label: option.label,
					color: option.model,
					options: {
						hasBorder: option.hasBorder
					}
				} ) ),
				columns: this.columns,
				removeButtonLabel: t( 'Remove color' ),
				documentColorsLabel: documentColorsCount !== 0 ? t( 'Document colors' ) : '',
				documentColorsCount: documentColorsCount === undefined ? this.columns : documentColorsCount
			} );

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

