/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignment
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import AlignmentEngine from './alignmentengine';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import alignLeftIcon from '../theme/icons/alignleft.svg';
import alignRightIcon from '../theme/icons/alignright.svg';
import alignCenterIcon from '../theme/icons/aligncenter.svg';
import alignJustifyIcon from '../theme/icons/alignjustify.svg';

/**
 * The alignment plugin.
 *
 * It introduces the `'alignLeft'`, `'alignRight'`, `'alignCenter'` and `'alignJustify'` buttons
 * and requires the {@link module:alignment/alignmentengine~AlignmentEngine} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Alignment extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ AlignmentEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Alignment';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const t = this.editor.t;
		this._addButton( 'alignLeft', t( 'Left' ), alignLeftIcon );
		this._addButton( 'alignRight', t( 'Right' ), alignRightIcon );
		this._addButton( 'alignCenter', t( 'Center' ), alignCenterIcon );
		this._addButton( 'alignJustify', t( 'Justify' ), alignJustifyIcon );
	}

	/**
	 * Helper method for initializing a button and linking it with an appropriate command.
	 *
	 * @private
	 * @param {String} commandName The name of the command.
	 * @param {Object} label The button label.
	 * @param {String} icon The source of the icon.
	 */
	_addButton( commandName, label, icon ) {
		const editor = this.editor;
		const command = editor.commands.get( commandName );

		editor.ui.componentFactory.add( commandName, locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label,
				icon,
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
