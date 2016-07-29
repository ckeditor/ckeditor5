/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../feature.js';
import BoldEngine from './boldengine.js';
import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';
import Model from '../ui/model.js';

/**
 * The Bold feature. It introduces the `bold` button and <kbd>CTRL+B</kbd> keystroke.
 *
 * It uses the {@link basic-styles.BoldEngine Bold engine feature}.
 *
 * @memberOf basic-styles
 * @extends ckeditor5.Feature
 */
export default class Bold extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ BoldEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'bold' );

		// Create button model.
		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Bold' ),
			icon: 'bold',
			iconAlign: 'left'
		} );

		// Bind button model to command.
		buttonModel.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		this.listenTo( buttonModel, 'execute', () => editor.execute( 'bold' ) );

		// Add bold button to feature components.
		editor.ui.featureComponents.add( 'bold', ButtonController, ButtonView, buttonModel );

		// Set the CTRL+B keystroke.
		editor.keystrokes.set( 'CTRL+B', 'bold' );
	}
}
