/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Toolbar from './toolbar.js';

/**
 * The editor sticky toolbar controller class.
 *
 * @memberOf ui.bindings
 * @extends ui.toolbar.Toolbar
 */

export default class StickyToolbar extends Toolbar {
	/**
	 * Creates a new toolbar instance.
	 *
	 * @param {ui.Model} model
	 * @param {ui.View} view
	 * @param {ckeditor5.Editor} editor
	 */
	constructor( model, view, editor ) {
		super( model, view, editor );

		model.bind( 'isActive' ).to( editor.editables, 'current', c => !!c );
	}
}

/**
 * The basic sticky toolbar model interface.
 *
 * @memberOf ui.stickyToolbar
 * @interface StickyToolbarModel
 */

/**
 * Indicates whether the toolbar should be active. When any editable
 * is focused in the editor, toolbar becomes active.
 *
 * @readonly
 * @observable
 * @member {Boolean} ui.button.StickyToolbarModel#isActive
 */
