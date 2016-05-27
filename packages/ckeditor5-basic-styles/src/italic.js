/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import ItalicEngine from './italicengine.js';
import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';
import Model from '../ui/model.js';

export default class Italic extends Feature {
	static get requires() {
		return [ ItalicEngine ];
	}

	init() {
		const editor = this.editor;
		const t = editor.t;
		const ui = editor.ui;
		const command = editor.commands.get( 'italic' );

		// Create button model.
		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Italic' ),
			icon: 'italic',
			iconAlign: 'LEFT'
		} );

		// Bind button model to command.
		buttonModel.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		this.listenTo( buttonModel, 'execute', () => editor.execute( 'italic' ) );

		// Add bold button to feature components.
		ui.featureComponents.add( 'italic', ButtonController, ButtonView, buttonModel );
	}
}
