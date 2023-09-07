/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colorui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import type { Batch } from 'ckeditor5/src/engine';
import {
	createDropdown,
	normalizeColorOptions,
	getLocalizedColorOptions,
	focusChildOnDropdownOpen,
	type ColorSelectorView,
	type ColorSelectorExecuteEvent,
	type ColorSelectorColorPickerCancelEvent,
	type ColorSelectorColorPickerShowEvent
} from 'ckeditor5/src/ui';

import {
	addColorSelectorToDropdown,
	type ColorSelectorDropdownView,
	type FONT_BACKGROUND_COLOR,
	type FONT_COLOR
} from '../utils';
import type FontColorCommand from '../fontcolor/fontcolorcommand';
import type FontBackgroundColorCommand from '../fontbackgroundcolor/fontbackgroundcolorcommand';
import type { FontColorConfig } from '../fontconfig';

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
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
	 * Keeps a reference to {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
	 */
	public colorSelectorView: ColorSelectorView | undefined;

	/**
	 * Keeps all changes in color picker in one batch while dropdown is open.
	 */
	declare private _undoStepBatch: Batch;

	/**
	 * Creates a plugin which introduces a dropdown with a pre–configured
	 * {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
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
		this.colorSelectorView = undefined;
	}

	/**
	* @inheritDoc
	*/
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;
		const command: FontColorCommand | FontBackgroundColorCommand = editor.commands.get( this.commandName )!;
		const componentConfig = editor.config.get( this.componentName )! as FontColorConfig;
		const colorsConfig = normalizeColorOptions( componentConfig.colors! );
		const localizedColors = getLocalizedColorOptions( locale, colorsConfig );
		const documentColorsCount = componentConfig.documentColors;
		const hasColorPicker = componentConfig.colorPicker !== false;

		// Register the UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
			const dropdownView: ColorSelectorDropdownView = createDropdown( locale );
			// Font color dropdown rendering is deferred once it gets open to improve performance (#6192).
			let dropdownContentRendered = false;

			this.colorSelectorView = addColorSelectorToDropdown( {
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
				colorPickerLabel: t( 'Color picker' ),
				documentColorsLabel: documentColorsCount !== 0 ? t( 'Document colors' ) : '',
				documentColorsCount: documentColorsCount === undefined ? this.columns : documentColorsCount,
				colorPickerViewConfig: hasColorPicker ? ( componentConfig.colorPicker || {} ) : false
			} );

			this.colorSelectorView.bind( 'selectedColor' ).to( command, 'value' );

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

			this.colorSelectorView.on<ColorSelectorExecuteEvent>( 'execute', ( evt, data ) => {
				if ( dropdownView.isOpen ) {
					editor.execute( this.commandName, {
						value: data.value,
						batch: this._undoStepBatch
					} );
				}

				if ( data.source !== 'colorPicker' ) {
					editor.editing.view.focus();
				}

				if ( data.source === 'colorPickerSaveButton' ) {
					dropdownView.isOpen = false;
				}
			} );

			this.colorSelectorView.on<ColorSelectorColorPickerShowEvent>( 'colorPicker:show', () => {
				this._undoStepBatch = editor.model.createBatch();
			} );

			this.colorSelectorView.on<ColorSelectorColorPickerCancelEvent>( 'colorPicker:cancel', () => {
				if ( this._undoStepBatch!.operations.length ) {
					// We need to close the dropdown before the undo batch.
					// Otherwise, ColorUI treats undo as a selected color change,
					// propagating the update to the whole selection.
					// That's an issue if spans with various colors were selected.
					dropdownView.isOpen = false;
					editor.execute( 'undo', this._undoStepBatch );
				}

				editor.editing.view.focus();
			} );

			dropdownView.on( 'change:isOpen', ( evt, name, isVisible ) => {
				if ( !dropdownContentRendered ) {
					dropdownContentRendered = true;

					dropdownView.colorSelectorView!.appendUI();
				}

				if ( isVisible ) {
					if ( documentColorsCount !== 0 ) {
						this.colorSelectorView!.updateDocumentColors( editor.model, this.componentName );
					}

					this.colorSelectorView!.updateSelectedColors();
					this.colorSelectorView!.showColorGridsFragment();
				}
			} );

			// Accessibility: focus the first active color when opening the dropdown.
			focusChildOnDropdownOpen(
				dropdownView,
				() => dropdownView.colorSelectorView!.colorGridsFragmentView.staticColorsGrid!.items.find( ( item: any ) => item.isOn )
			);

			return dropdownView;
		} );
	}
}
