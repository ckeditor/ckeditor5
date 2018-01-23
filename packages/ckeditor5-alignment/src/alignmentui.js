/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import {
	addToolbarToDropdown,
	closeDropdownOnBlur,
	closeDropdownOnExecute,
	createSingleButtonDropdown,
	enableModelIfOneIsEnabled,
	focusDropdownContentsOnArrows,
	getBindingTargets
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import { commandNameFromOptionName } from './alignmentcommand';
import { isSupported } from './alignmentediting';

import alignLeftIcon from '../theme/icons/align-left.svg';
import alignRightIcon from '../theme/icons/align-right.svg';
import alignCenterIcon from '../theme/icons/align-center.svg';
import alignJustifyIcon from '../theme/icons/align-justify.svg';

const icons = new Map( [
	[ 'left', alignLeftIcon ],
	[ 'right', alignRightIcon ],
	[ 'center', alignCenterIcon ],
	[ 'justify', alignJustifyIcon ]
] );

/**
 * The default alignment UI plugin.
 *
 * It introduces the `'alignLeft'`, `'alignRight'`, `'alignCenter'` and `'alignJustify'` buttons
 * and the `'alignmentDropdown'` drop-down.
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
		const options = editor.config.get( 'alignment.options' );

		options
			.filter( isSupported )
			.forEach( option => this._addButton( option ) );

		componentFactory.add( 'alignmentDropdown', locale => {
			const buttons = options.map( option => {
				return componentFactory.create( commandNameFromOptionName( option ) );
			} );

			const dropdownModel = new Model( {
				label: t( 'Text alignment' ),
				defaultIcon: alignLeftIcon,
				withText: false,
				isVertical: true,
				tooltip: true,
				buttons
			} );

			// TODO: binding with callback as in headings
			// Change icon upon selection
			dropdownModel.bind( 'icon' ).to(
				// Bind to #isOn of each button...
				...getBindingTargets( buttons, 'isOn' ),
				// ...and chose the title of the first one which #isOn is true.
				( ...areActive ) => {
					const index = areActive.findIndex( value => value );

					// If none of the commands is active, display either defaultIcon or first button icon.
					if ( index < 0 && dropdownModel.defaultIcon ) {
						return dropdownModel.defaultIcon;
					}

					return dropdownModel.buttons[ index < 0 ? 0 : index ].icon;
				}
			);

			// Add specialised behavior
			enableModelIfOneIsEnabled( dropdownModel, dropdownModel.buttons );

			const dropdownView = createSingleButtonDropdown( dropdownModel, locale );

			addToolbarToDropdown( dropdownView, dropdownModel );
			closeDropdownOnBlur( dropdownView );
			closeDropdownOnExecute( dropdownView );
			focusDropdownContentsOnArrows( dropdownView );

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

		const commandName = commandNameFromOptionName( option );
		const command = editor.commands.get( commandName );

		editor.ui.componentFactory.add( commandName, locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: this.localizedOptionTitles[ option ],
				icon: icons.get( option ),
				tooltip: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( commandName );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
	}
}

/**
 * TODO: move somewhere
 * Defines default icon which is used when no button is active.
 *
 * Also see {@link #icon}.
 *
 * @observable
 * @member {String} #defaultIcon
 */
