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
import IconManagerView from '../iconmanager/iconmanagerview.js';
import iconManagerModel from '../../../theme/iconmanagermodel.js';
import mix from '../../utils/mix.js';

/**
 * The EditorUI controller class. It's a base class for the editor
 * main view controllers.
 *
 *		// An instance of EditorUI.
 *		new EditorUI( editor );
 *
 * See {@link ui.editorUI.EditorUIView}.
 *
 * @memberOf ui.editorUI
 * @extends ui.Controller
 * @mixes utils.ObservaleMixin
 */
export default class EditorUI extends Controller {
	/**
	 * Creates an instance of {@link ui.editorUI.EditorUI} class.
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
		this._setupIconManager();

		return super.init();
	}

	/**
	 * Adds IconManager into DOM.
	 *
	 * @protected
	 */
	_setupIconManager() {
		/**
		 * Icons available in the UI.
		 *
		 * @readonly
		 * @member {Array} ui.editorUI.EditorUI#icons
		 */
		this.icons = iconManagerModel.icons;

		this.collections.get( 'body' ).add(
			new IconManager( iconManagerModel, new IconManagerView() )
		);
	}
}

mix( EditorUI, ObservableMixin );
