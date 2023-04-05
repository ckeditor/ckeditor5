/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown } from 'ckeditor5/src/ui';

import { isSupported, normalizeAlignmentOptions } from './utils';
import type { SupportedOption } from './alignmentconfig';
import type AlignmentCommand from './alignmentcommand';

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
	public static get pluginName(): 'AlignmentUI' {
		return 'AlignmentUI';
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

			// Add existing alignment buttons to dropdown's toolbar.
			addToolbarToDropdown(
				dropdownView,
				() => options.map( option => componentFactory.create( `alignment:${ option.name }` ) ) as Array<ButtonView>,
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

		editor.ui.componentFactory.add( `alignment:${ option }`, locale => {
			const command: AlignmentCommand = editor.commands.get( 'alignment' )!;
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: this.localizedOptionTitles[ option ],
				icon: iconsMap.get( option ),
				tooltip: true,
				isToggleable: true
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
		} );
	}
}
