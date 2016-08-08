/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import mix from '../../utils/mix.js';
import ToolbarBindingsMixin from './toolbarbindingsmixin.js';
import BaseStickyToolbar from '../toolbar/sticky/stickytoolbar.js';

/**
 * The editor sticky toolbar controller class.
 *
 * See {@link ui.stickyToolbar.StickyToolbar}.
 *
 * @memberOf ui.bindings
 * @extends ui.stickyToolbar.StickyToolbar
 */
export default class StickyToolbar extends BaseStickyToolbar {
	/**
	 * Creates an instance of {@link ui.bindings.StickyToolbar} class.
	 *
	 * @param {ui.stickyToolbar.StickyToolbarModel} model Model of this sticky toolbar.
	 * @param {ui.View} view View of this sticky toolbar.
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

mix( StickyToolbar, ToolbarBindingsMixin );
