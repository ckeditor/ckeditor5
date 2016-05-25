/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BoldEngine from './boldengine.js';
import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';
import Model from '../ui/model.js';

export default class Bold extends Feature {
	static get requires() {
		return [ BoldEngine ];
	}

	init() {
		const editor = this.editor;
		const t = editor.t;
		const ui = editor.ui;
		const command = editor.commands.get( 'bold' );

		// Create button model.
		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Bold' ),
			icon: 'bold'
		} );

		// Bind button model to command.
		buttonModel.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		this.listenTo( buttonModel, 'execute', () => editor.execute( 'bold' ) );

		// Add bold button to feature components.
		ui.featureComponents.add( 'bold', ButtonController, ButtonView, buttonModel );
	}
}
