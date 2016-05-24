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

		const undoCommand = editor.commands.get( 'undo' );
		const redoCommand = editor.commands.get( 'redo' );

		const undoModel = new Model( {
			isOn: false,
			label: t( 'Undo' ),
			icon: 'undo'
		} );
		const redoModel = new Model( {
			isOn: false,
			label: t( 'Redo' ),
			icon: 'redo'
		} );

		undoModel.bind( 'isEnabled' ).to( undoCommand, 'isEnabled' );
		redoModel.bind( 'isEnabled' ).to( redoCommand, 'isEnabled' );

		this.listenTo( undoModel, 'execute', () => editor.execute( 'undo' ) );
		this.listenTo( redoModel, 'execute', () => editor.execute( 'redo' ) );

		editor.ui.featureComponents.add( 'undo', Button, ButtonView, undoModel );
		editor.ui.featureComponents.add( 'redo', Button, ButtonView, redoModel );
	}
}
