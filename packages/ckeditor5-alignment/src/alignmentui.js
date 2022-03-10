/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown } from 'ckeditor5/src/ui';

import { isSupported, normalizeAlignmentOptions } from './utils';

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
 *
 * @extends module:core/plugin~Plugin
 */
export default class AlignmentUI extends Plugin {
	/**
	 * Returns the localized option titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:alignment/alignment~AlignmentConfig#options} are available:
	 *
	 * * `'left'`,
	 * * `'right'`,
	 * * `'center'`,
	 * * `'justify'`.
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedOptionTitles() {
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
	static get pluginName() {
		return 'AlignmentUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;
		const options = normalizeAlignmentOptions( editor.config.get( 'alignment.options' ) );

		options
			.map( option => option.name )
			.filter( isSupported )
			.forEach( option => this._addButton( option ) );

		componentFactory.add( 'alignment', locale => {
			const dropdownView = createDropdown( locale );

			// Add existing alignment buttons to dropdown's toolbar.
			const buttons = options.map( option => componentFactory.create( `alignment:${ option.name }` ) );
			addToolbarToDropdown( dropdownView, buttons );

			// Configure dropdown properties an behavior.
			dropdownView.buttonView.set( {
				label: t( 'Text alignment' ),
				tooltip: true
			} );

			dropdownView.toolbarView.isVertical = true;
			dropdownView.toolbarView.ariaLabel = t( 'Text alignment toolbar' );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-alignment-dropdown'
				}
			} );

			// The default icon depends on the direction of the content.
			const defaultIcon = locale.contentLanguageDirection === 'rtl' ? iconsMap.get( 'right' ) : iconsMap.get( 'left' );

			// Change icon to reflect current selection's alignment.
			dropdownView.buttonView.bind( 'icon' ).toMany( buttons, 'isOn', ( ...areActive ) => {
				// Get the index of an active button.
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display either defaultIcon or the first button's icon.
				if ( index < 0 ) {
					return defaultIcon;
				}

				// Return active button's icon.
				return buttons[ index ].icon;
			} );

			// Enable button if any of the buttons is enabled.
			dropdownView.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

			return dropdownView;
		} );
	}

	/**
	 * Helper method for initializing the button and linking it with an appropriate command.
	 *
	 * @private
	 * @param {String} option The name of the alignment option for which the button is added.
	 */
	_addButton( option ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( `alignment:${ option }`, locale => {
			const command = editor.commands.get( 'alignment' );
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
