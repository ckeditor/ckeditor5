/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import alignLeftIcon from '../theme/icons/align-left.svg';
import alignRightIcon from '../theme/icons/align-right.svg';
import alignCenterIcon from '../theme/icons/align-center.svg';
import alignJustifyIcon from '../theme/icons/align-justify.svg';
import AlignmentEditing, { isSupported } from './alignmentediting';
import createButtonDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/button/createbuttondropdown';
import Model from '../../ckeditor5-ui/src/model';

const icons = new Map( [
	[ 'left', alignLeftIcon ],
	[ 'right', alignRightIcon ],
	[ 'center', alignCenterIcon ],
	[ 'justify', alignJustifyIcon ]
] );

/**
 * The default Alignment UI plugin.
 *
 * It introduces the `'alignLeft'`, `'alignRight'`, `'alignCenter'` and `'alignJustify'` buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AlignmentUI extends Plugin {
	/**
	 * Returns the localized style titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:alignment/alignmentediting~AlignmentEditingConfig#styles} are available:
	 *
	 * * `'Left'`,
	 * * `'Right'`,
	 * * `'Center'`,
	 * * `'Justify'`
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedStylesTitles() {
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
	static get requires() {
		return [ AlignmentEditing ];
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
		const styles = editor.config.get( 'alignment.styles' );

		styles
			.filter( isSupported )
			.forEach( style => this._addButton( style ) );

		componentFactory.add( 'alignmentDropdown', locale => {
			const buttons = styles.map( style => componentFactory.create( AlignmentEditing.commandName( style ) ) );

			const model = new Model( {
				label: t( 'Text alignment' ),
				withText: false,
				isVertical: true
			} );

			return createButtonDropdown( model, buttons, locale );
		} );
	}

	/**
	 * Helper method for initializing a button and linking it with an appropriate command.
	 *
	 * @private
	 * @param {String} style The name of style for which add button.
	 */
	_addButton( style ) {
		const editor = this.editor;

		const commandName = AlignmentEditing.commandName( style );
		const command = editor.commands.get( commandName );

		editor.ui.componentFactory.add( commandName, locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: this.localizedStylesTitles[ style ],
				icon: icons.get( style ),
				tooltip: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => editor.execute( commandName ) );

			return buttonView;
		} );
	}
}
