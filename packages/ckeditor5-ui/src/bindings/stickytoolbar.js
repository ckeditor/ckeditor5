/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ToolbarBindingsMixin from './toolbarbindingsmixin.js';
import BaseStickyToolbar from '../stickytoolbar/stickytoolbar.js';

/**
 * The editor StickyToolbar controller class.
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
	 * @param {ui.stickyToolbar.StickyToolbarModel} model Model of this StickyToolbar.
	 * @param {ui.View} view View of this StickyToolbar.
	 * @param {ckeditor5.Editor} editor
	 */
	constructor( model, view, editor ) {
		super( model, view );

		this.editor = editor;
	}
}

Object.assign( StickyToolbar.prototype, ToolbarBindingsMixin );
