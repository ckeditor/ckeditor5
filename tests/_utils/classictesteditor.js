/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from '/ckeditor5/editor/standardeditor.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.ckeditor5._utils
 * @extends ckeditor5.editor.StandardEditor
 */
export default class ClassicTestEditor extends StandardEditor {
	/**
	 * @inheritDoc
	 */
	constructor( element, config ) {
		super( element, config );

		this.document.createRoot();

		this.editing.createRoot( 'div' );

		this.data.processor = new HtmlDataProcessor();

		this.ui = new BoxedEditorUI( this );
		this.ui.view = new BoxedEditorUIView( this.locale );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		return this.ui.destroy()
			.then( () => super.destroy() );
	}

	/**
	 * @inheritDoc
	 */
	static create( element, config ) {
		return new Promise( ( resolve ) => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => editor.loadDataFromEditorElement() )
					.then( () => editor )
			);
		} );
	}
}
