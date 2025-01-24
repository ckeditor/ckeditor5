/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontsize/fontsizeui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconFontSize } from 'ckeditor5/src/icons.js';
import {
	ViewModel,
	createDropdown,
	addListToDropdown,
	type ListDropdownButtonDefinition,
	MenuBarMenuView,
	MenuBarMenuListView,
	MenuBarMenuListItemView,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';

import { normalizeOptions } from './utils.js';
import { FONT_SIZE } from '../utils.js';

import '../../theme/fontsize.css';
import type { FontSizeOption } from '../fontconfig.js';
import type FontSizeCommand from './fontsizecommand.js';

/**
 * The font size UI plugin. It introduces the `'fontSize'` dropdown.
 */
export default class FontSizeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontSizeUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		const options = this._getLocalizedOptions();

		const command: FontSizeCommand = editor.commands.get( FONT_SIZE )!;
		const accessibleLabel = t( 'Font Size' );

		const listOptions = _prepareListOptions( options, command );

		// Register UI component.
		editor.ui.componentFactory.add( FONT_SIZE, locale => {
			const dropdownView = createDropdown( locale );

			addListToDropdown( dropdownView, listOptions, {
				role: 'menu',
				ariaLabel: accessibleLabel
			} );

			// Create dropdown model.
			dropdownView.buttonView.set( {
				label: accessibleLabel,
				icon: IconFontSize,
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
				editor.execute( ( evt.source as any ).commandName, { value: ( evt.source as any ).commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( `menuBar:${ FONT_SIZE }`, locale => {
			const menuView = new MenuBarMenuView( locale );

			menuView.buttonView.set( {
				label: accessibleLabel,
				icon: IconFontSize
			} );

			menuView.bind( 'isEnabled' ).to( command );

			const listView = new MenuBarMenuListView( locale );

			for ( const definition of listOptions ) {
				const listItemView = new MenuBarMenuListItemView( locale, menuView );
				const buttonView = new MenuBarMenuListItemButtonView( locale );

				buttonView.set( {
					role: 'menuitemradio',
					isToggleable: true
				} );

				buttonView.bind( ...Object.keys( definition.model ) as Array<keyof MenuBarMenuListItemButtonView> ).to( definition.model );
				buttonView.delegate( 'execute' ).to( menuView );

				buttonView.on( 'execute', () => {
					editor.execute( ( definition.model as any ).commandName, {
						value: ( definition.model as any ).commandParam
					} );

					editor.editing.view.focus();
				} );

				listItemView.children.add( buttonView );
				listView.items.add( listItemView );
			}

			menuView.panelView.children.add( listView );

			return menuView;
		} );
	}

	/**
	 * Returns options as defined in `config.fontSize.options` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontconfig~FontSizeOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 */
	private _getLocalizedOptions(): Array<FontSizeOption> {
		const editor = this.editor;
		const t = editor.t;

		const localizedTitles: Record<string, string> = {
			Default: t( 'Default' ),
			Tiny: t( 'Tiny' ),
			Small: t( 'Small' ),
			Big: t( 'Big' ),
			Huge: t( 'Huge' )
		};

		const options = normalizeOptions( ( editor.config.get( FONT_SIZE )! ).options! );

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

/**
 * Prepares FontSize dropdown items.
 */
function _prepareListOptions( options: Array<FontSizeOption>, command: FontSizeCommand ): Collection<ListDropdownButtonDefinition> {
	const itemDefinitions = new Collection<ListDropdownButtonDefinition>();

	for ( const option of options ) {
		const def = {
			type: 'button' as const,
			model: new ViewModel( {
				commandName: FONT_SIZE,
				commandParam: option.model,
				label: option.title,
				class: 'ck-fontsize-option',
				role: 'menuitemradio',
				withText: true
			} )
		};

		if ( option.view && typeof option.view !== 'string' ) {
			if ( option.view.styles ) {
				def.model.set( 'labelStyle', `font-size:${ option.view.styles[ 'font-size' ] }` );
			}
			if ( option.view.classes ) {
				def.model.set( 'class', `${ def.model.class } ${ option.view.classes }` );
			}
		}

		def.model.bind( 'isOn' ).to( command, 'value', value => value === option.model );

		// Add the option to the collection.
		itemDefinitions.add( def );
	}

	return itemDefinitions;
}
