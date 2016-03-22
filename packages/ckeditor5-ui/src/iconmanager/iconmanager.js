/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';
import IconManagerView from './iconmanagerview.js';

/**
 *
 * @memberOf ui.iconManager
 * @extends ui.Controller
 */

export default class IconManager extends Controller {
	/**
	 * Creates IconManager instances.
	 *
	 * @param {ckeditor5.Editor} editor
	 */
	constructor( editor ) {
		super();

		this.view = new IconManagerView();

		/**
		 * @readonly
		 * @member {ckeditor5.Editor} ui.iconManager.IconManager#editor
		 */
		this.editor = editor;
	}
}

