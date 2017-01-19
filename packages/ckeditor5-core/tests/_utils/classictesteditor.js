/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from '../../src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ClassicTestEditorUI from './classictesteditorui';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.StandardEditor
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

		this.ui = new ClassicTestEditorUI( this, new BoxedEditorUIView( this.locale ) );
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
					.then( () => editor.fire( 'uiReady' ) )
					.then( () => editor.loadDataFromEditorElement() )
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
