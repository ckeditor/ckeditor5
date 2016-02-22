/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../ui/controller.js';
import ControllerCollection from '../ui/controllercollection.js';
import ComponentFactory from '../ui/componentfactory.js';
import ObservableMixin from '../observablemixin.js';
import utils from '../utils.js';

/**
 * Base class for the editor main view controllers.
 *
 * @memberOf core
 * @class core.editorui.EditorUI
 * @extends core.ui.Controller
 * @mixes core.ObservableMixin
 */

export default class EditorUI extends Controller {
	constructor( editor ) {
		super();

		/**
		 * @readonly
		 * @member {core.Editor} core.EditorUI#editor
		 */
		this.editor = editor;

		/**
		 * @readonly
		 * @member {core.ui.ComponentFactory} core.EditorUI#featureComponents
		 */
		this.featureComponents = new ComponentFactory( editor );

		this.collections.add( new ControllerCollection( 'body' ) );
	}
}

utils.mix( EditorUI, ObservableMixin );
