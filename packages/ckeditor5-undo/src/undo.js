/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import UndoEngine from './undoengine.js';
import Model from '../ui/model.js';
import Button from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';

/**
 * Undo feature.
 *
 * Undo features brings in possibility to undo and re-do changes done in Tree Model by deltas through Batch API.
 *
 * @memberOf undo
 */
export default class Undo extends Feature {
	static get requires() {
		return [ UndoEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		this._addButton( 'undo', t( 'Undo' ) );
		this._addButton( 'redo', t( 'Redo' ) );

		editor.keystrokes.set( 'CTRL+Z', 'undo' );
		editor.keystrokes.set( 'CTRL+Y', 'redo' );
		editor.keystrokes.set( 'CTRL+SHIFT+Z', 'redo' );
	}

	/**
	 * Creates a button for a specified command.
	 *
	 * @private
	 * @param {String} name Command name.
	 * @param {String} label Button label.
	 */
	_addButton( name, label ) {
		const editor = this.editor;

		const command = editor.commands.get( name );

		const model = new Model( {
			isOn: false,
			label: label,
			icon: name,
			iconAlign: 'LEFT'
		} );

		model.bind( 'isEnabled' ).to( command, 'isEnabled' );

		this.listenTo( model, 'execute', () => editor.execute( name ) );

		editor.ui.featureComponents.add( name, Button, ButtonView, model );
	}
}
