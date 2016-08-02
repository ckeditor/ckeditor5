/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EditorUI from '../../../ui/editorui/editorui.js';

/**
 * The boxed editor UI controller class. This class controls an editor interface
 * consisting of a toolbar and an editable area, enclosed within a box.
 *
 *		// An instance of BoxedEditorUI.
 *		new BoxedEditorUI( editor );
 *
 * See {@link ui.editorUI.boxed.BoxedEditorUIView}.
 *
 * @member ui.editorUI.boxed
 * @extends ui.editorUI.EditorUI
 */
export default class BoxedEditorUI extends EditorUI {
	/**
	 * Creates a boxed editor UI instance.
	 *
	 * @param {core.editor.Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		this.addCollection( 'top' );
		this.addCollection( 'main' );

		const config = editor.config;

		/**
		 * The editor's width. Defaults to {@link core.editor.config.ui.width}.
		 *
		 * Note: a specific creator that was used must support this setting.
		 *
		 * @observable
		 * @property {Number} width
		 */
		this.set( 'width', config.get( 'ui.width' ) );

		/**
		 * The editor's height. Defaults to {@link core.editor.config.ui.height}.
		 *
		 * Note: a specific creator that was used must support this setting.
		 *
		 * @observable
		 * @property {Number} height
		 */
		this.set( 'height', config.get( 'ui.height' ) );
	}
}
