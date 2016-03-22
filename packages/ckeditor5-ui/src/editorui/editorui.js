/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';
import ControllerCollection from '../controllercollection.js';
import ComponentFactory from '../componentfactory.js';
import ObservableMixin from '../../utils/observablemixin.js';
import IconManager from '../iconmanager/iconmanager.js';
import utils from '../../utils/utils.js';

/**
 * Base class for the editor main view controllers.
 *
 * @memberOf ui.editorUI
 * @extends ui.Controller
 * @mixes utils.ObservaleMixin
 */

export default class EditorUI extends Controller {
	/**
	 * Creates an EditorUI instance.
	 *
	 * @param {ckeditor5.Editor} editor
	 */
	constructor( editor ) {
		super();

		/**
		 * @readonly
		 * @member {ckeditor5.Editor} ui.editorUI.EditorUI#editor
		 */
		this.editor = editor;

		/**
		 * Property used by the [CKEditor UI library](https://github.com/ckeditor/ckeditor5-ui) for storing
		 * the main UI controller.
		 *
		 * @readonly
		 * @member {ui.editorui.EditorUI} ckeditor5.Editor#ui
		 */
		editor.ui = this;

		/**
		 * @readonly
		 * @member {ui.ComponentFactory} ui.editorUI.EditorUI#featureComponents
		 */
		this.featureComponents = new ComponentFactory( editor );

		this.collections.add( new ControllerCollection( 'body' ) );
	}

	/**
	 * Initializes EditorUI instance.
	 *
	 * @returns {Promise}
	 */
	init() {
		return super.init().then( () => {
			this._addIconManager();
		} );
	}

	/**
	 * Adds IconManager into DOM.
	 *
	 * @protected
	 */
	_addIconManager() {
		this.collections.get( 'body' ).add( new IconManager( this.editor ) );
	}
}

utils.mix( EditorUI, ObservableMixin );
