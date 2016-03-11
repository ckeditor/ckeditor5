/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';
import ControllerCollection from '../controllercollection.js';
import ComponentFactory from '../componentfactory.js';
import ObservableMixin from '../../utils/observablemixin.js';
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
	 * @param {core.Editor} editor
	 */
	constructor( editor ) {
		super();

		/**
		 * @readonly
		 * @member {core.Editor} core.editorUI.EditorUI#editor
		 */
		this.editor = editor;

		/**
		 * @readonly
		 * @member {core.ui.ComponentFactory} core.editorUI.EditorUI#featureComponents
		 */
		this.featureComponents = new ComponentFactory( editor );

		this.collections.add( new ControllerCollection( 'body' ) );
	}
}

utils.mix( EditorUI, ObservableMixin );
