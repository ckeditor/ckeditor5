/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUI from '/ckeditor5/ui/editorui/editorui.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';

export default class BoxedEditorUI extends EditorUI {
	constructor( editor ) {
		super( editor );

		this.collections.add( new ControllerCollection( 'top' ) );
		this.collections.add( new ControllerCollection( 'editable' ) );

		const config = editor.config;

		/**
		 * @property {Number} width
		 */
		this.set( 'width', config.get( 'ui.width' ) );

		/**
		 * @property {Number} height
		 */
		this.set( 'height', config.get( 'ui.height' ) );
	}

	/**
	 * @readonly
	 * @property {Model} viewModel
	 */
	get viewModel() {
		return this;
	}
}
