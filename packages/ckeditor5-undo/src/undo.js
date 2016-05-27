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

		this._initFeature( 'undo', t( 'Undo' ) );
		this._initFeature( 'redo', t( 'Redo' ) );

		editor.keystrokes.set( 'ctrl + z', 'undo' );
		editor.keystrokes.set( 'ctrl + y', 'redo' );
		editor.keystrokes.set( 'ctrl + shift + z', 'redo' );
	}

	_initFeature( name, label ) {
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
