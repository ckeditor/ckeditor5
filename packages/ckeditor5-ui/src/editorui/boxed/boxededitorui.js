/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUI from '/ckeditor5/ui/editorui/editorui.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';

/**
 * Boxed editor UI. The class representing classic editor interface, which contains of a toolbar and editable are,
 * closed within a box.
 *
 * @member ui.editorUI.boxed
 * @extends ui.editorUI.EditorUI
 */
export default class BoxedEditorUI extends EditorUI {
	/**
	 * Creates a BoxedEditorUI instance.
	 *
	 * @param {ckeditor5.Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		this.collections.add( new ControllerCollection( 'top' ) );
		this.collections.add( new ControllerCollection( 'main' ) );

		const config = editor.config;

		/**
		 * The editor's width. Defaults to {@link ckeditor5.editor.config.ui.width}.
		 *
		 * Note: a specific creator that was used must support this setting.
		 *
		 * @observable
		 * @property {Number} width
		 */
		this.set( 'width', config.get( 'ui.width' ) );

		/**
		 * The editor's height. Defaults to {@link ckeditor5.editor.config.ui.height}.
		 *
		 * Note: a specific creator that was used must support this setting.
		 *
		 * @observable
		 * @property {Number} height
		 */
		this.set( 'height', config.get( 'ui.height' ) );
	}

	/**
	 * @readonly
	 * @property {ui.Model} viewModel
	 */
	get viewModel() {
		return this;
	}
}
