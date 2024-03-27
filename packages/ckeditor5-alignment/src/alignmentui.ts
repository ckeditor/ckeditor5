/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import { ButtonView, createDropdown, addToolbarToDropdown, type Button } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';

import { isSupported, normalizeAlignmentOptions } from './utils.js';
import type { SupportedOption } from './alignmentconfig.js';
import type AlignmentCommand from './alignmentcommand.js';

const iconsMap = new Map( [
	[ 'left', icons.alignLeft ],
	[ 'right', icons.alignRight ],
	[ 'center', icons.alignCenter ],
	[ 'justify', icons.alignJustify ]
] );

/**
 * The default alignment UI plugin.
 *
 * It introduces the `'alignment:left'`, `'alignment:right'`, `'alignment:center'` and `'alignment:justify'` buttons
 * and the `'alignment'` dropdown.
 */
export default class AlignmentUI extends Plugin {
	/**
	 * Returns the localized option titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:alignment/alignmentconfig~AlignmentConfig#options} are available:
	 *
	 * * `'left'`,
	 * * `'right'`,
	 * * `'center'`,
	 * * `'justify'`.
	 *
	 * @readonly
	 */
	public get localizedOptionTitles(): Record<SupportedOption, string> {
		const t = this.editor.t;

		return {
			'left': t( 'Align left' ),
			'right': t( 'Align right' ),
			'center': t( 'Align center' ),
			'justify': t( 'Justify' )
		};
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'AlignmentUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;
		const options = normalizeAlignmentOptions( editor.config.get( 'alignment.options' )! );

		options
			.map( option => option.name )
			.filter( isSupported )
			.forEach( option => this._addButton( option ) );

		componentFactory.add( 'alignment', locale => {
			const dropdownView = createDropdown( locale );
			const tooltipPosition = locale.uiLanguageDirection === 'rtl' ? 'w' : 'e';

			// Add existing alignment buttons to dropdown's toolbar.
			addToolbarToDropdown(
				dropdownView,
				() => options.map( option => this._createButton( locale, option.name, { tooltipPosition } ) ) as Array<ButtonView>,
				{
					enableActiveItemFocusOnDropdownOpen: true,
					isVertical: true,
					ariaLabel: t( 'Text alignment toolbar' )
				}
			);

			// Configure dropdown properties an behavior.
			dropdownView.buttonView.set( {
				label: t( 'Text alignment' ),
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-alignment-dropdown'
				}
			} );

			// The default icon depends on the direction of the content.
			const defaultIcon = locale.contentLanguageDirection === 'rtl' ? iconsMap.get( 'right' ) : iconsMap.get( 'left' );
			const command: AlignmentCommand = editor.commands.get( 'alignment' )!;

			// Change icon to reflect current selection's alignment.
			dropdownView.buttonView.bind( 'icon' ).to( command, 'value', value => iconsMap.get( value ) || defaultIcon );

			// Enable button if any of the buttons is enabled.
			dropdownView.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Focus the editable after executing the command.
			// Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
			this.listenTo( dropdownView, 'execute', () => {
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Helper method for initializing the button and linking it with an appropriate command.
	 *
	 * @param option The name of the alignment option for which the button is added.
	 */
	private _addButton( option: SupportedOption ): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( `alignment:${ option }`, locale => this._createButton( locale, option ) );
	}

	/**
	 * Helper method for creating the button view element.
	 *
	 * @param locale Editor locale.
	 * @param option The name of the alignment option for which the button is added.
	 * @param buttonAttrs Optional parameters passed to button view instance.
	 */
	private _createButton(
		locale: Locale,
		option: SupportedOption,
		buttonAttrs: Partial<Button> = {}
	): ButtonView {
		const editor = this.editor;
		const command: AlignmentCommand = editor.commands.get( 'alignment' )!;
		const buttonView = new ButtonView( locale );

		buttonView.set( {
			label: this.localizedOptionTitles[ option ],
			icon: iconsMap.get( option ),
			tooltip: true,
			isToggleable: true,
			...buttonAttrs
		} );

		// Bind button model to command.
		buttonView.bind( 'isEnabled' ).to( command );
		buttonView.bind( 'isOn' ).to( command, 'value', value => value === option );

		// Execute command.
		this.listenTo( buttonView, 'execute', () => {
			editor.execute( 'alignment', { value: option } );
			editor.editing.view.focus();
		} );

		return buttonView;
	}
}
