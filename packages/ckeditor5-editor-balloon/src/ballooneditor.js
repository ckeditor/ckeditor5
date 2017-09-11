/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon/ballooneditor
 */

import StandardEditor from '@ckeditor/ckeditor5-core/src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';
import BalloonEditorUI from './ballooneditorui';
import BalloonEditorUIView from './ballooneditoruiview';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';

import '../theme/theme.scss';

/**
 * {@glink builds/guides/overview#Balloon-editor Balloon editor} - Uses an inline editable and a toolbar based
 * on the {@link module:ui/toolbar/contextual/contextualtoolbar~ContextualToolbar}.
 *
 * In order to create a Balloon editor, use the
 * {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} method.
 *
 * @extends module:core/editor/standardeditor~StandardEditor
 */
export default class BalloonEditor extends StandardEditor {
	/**
	 * Creates an instance of the balloon editor.
	 *
	 * <strong>Note:</strong> do not use the constructor to create editor instances. Use static
	 * {@link module:editor-balloon/ballooneditor~BalloonEditor#create BalloonEditor.create()} method instead.
	 *
	 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
	 * @param {Object} config The editor configuration.
	 */
	constructor( element, config ) {
		super( element, config );

		this.config.get( 'plugins' ).push( ContextualToolbar );
		this.config.define( 'contextualToolbar', this.config.get( 'toolbar' ) );

		this.document.createRoot();
		this.data.processor = new HtmlDataProcessor();
		this.ui = new BalloonEditorUI( this, new BalloonEditorUIView( this.locale, element ) );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		// Cache the data, then destroy.
		// It's safe to assume that the model->view conversion will not work after super.destroy().
		const data = this.getData();

		this.ui.destroy();

		return super.destroy()
			.then( () => setDataInElement( this.element, data ) );
	}

	/**
	 * Creates a balloon editor instance.
	 *
	 * Creating instance when using {@glink builds/index CKEditor build}:
	 *
	 *		BalloonEditor
	 *			.create( document.querySelector( '#editor' ) )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * Creating instance when using CKEditor from source (make sure to specify the list of plugins to load and the toolbar):
	 *
	 *		import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *		import ...
	 *
	 *		BalloonEditor
	 *			.create( document.querySelector( '#editor' ), {
	 *				plugins: [ Essentials, Bold, Italic, ... ],
	 *				toolbar: [ 'bold', 'italic', ... ]
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * @param {HTMLElement} element See {@link #constructor}'s parameters.
	 * @param {Object} config See {@link #constructor}'s parameters.
	 * @returns {Promise} A promise resolved once the editor is ready.
	 * @returns {module:core/editor/standardeditor~StandardEditor} return.editor The editor instance.
	 */
	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();
						editor.fire( 'uiReady' );
					} )
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
