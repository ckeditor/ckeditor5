/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import BaseToolbar from '../../../ui/toolbar/toolbar.js';

/**
 * The editor toolbar controller class.
 *
 * @memberOf core.ui.bindings
 * @extends ui.toolbar.Toolbar
 */

export default class Toolbar extends BaseToolbar {
	/**
	 * Creates a new toolbar instance.
	 *
	 * @param {core.ui.Model} model
	 * @param {core.ui.View} view
	 * @param {core.Editor} editor
	 */
	constructor( model, view, editor ) {
		super( model, view );

		this.editor = editor;
	}

	/**
	 * Adds buttons to the toolbar. Buttons are taken from the {@link core.editorUI.EditorUI#featureComponents}
	 * factory.
	 *
	 * @param {String[]} buttons The name of the buttons to add to the toolbar.
	 */
	addButtons( buttons ) {
		for ( let button of buttons ) {
			this.add( 'buttons', this.editor.ui.featureComponents.create( button ) );
		}
	}
}
