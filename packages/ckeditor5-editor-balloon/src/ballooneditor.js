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
 * The balloon editor. Uses an inline editable and a toolbar based
 * on the {@link module:ui/toolbar/contextual/contextualtoolbar~ContextualToolbar}.
 *
 * @extends module:core/editor/standardeditor~StandardEditor
 */
export default class BalloonEditor extends StandardEditor {
	/**
	 * Creates an instance of the balloon editor.
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
	 *		BalloonEditor.create( document.querySelector( '#editor' ), {
	 *			plugins: [ Delete, Enter, Typing, Paragraph, Undo, Bold, Italic ],
	 *			toolbar: [ 'bold', 'italic' ]
	 *		} )
	 *		.then( editor => {
	 *			console.log( 'Editor was initialized', editor );
	 *		} )
	 *		.catch( err => {
	 *			console.error( err.stack );
	 *		} );
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
