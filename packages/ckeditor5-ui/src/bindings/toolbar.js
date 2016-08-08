/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import mix from '../../utils/mix.js';
import ToolbarBindingsMixin from './toolbarbindingsmixin.js';
import BaseToolbar from '../toolbar/toolbar.js';

/**
 * The editor toolbar controller class.
 *
 * See {@link ui.toolbar.Toolbar}.
 *
 * @memberOf ui.bindings
 * @extends ui.toolbar.Toolbar
 */
export default class Toolbar extends BaseToolbar {
	/**
	 * Creates a new toolbar instance.
	 *
	 * @param {ui.Model} model
	 * @param {ui.View} view
	 * @param {core.editor.Editor} editor
	 */
	constructor( model, view, editor ) {
		super( model, view );

		this.editor = editor;
	}

	init() {
		this.bindToolbarItems();

		return super.init();
	}
}

mix( Toolbar, ToolbarBindingsMixin );
