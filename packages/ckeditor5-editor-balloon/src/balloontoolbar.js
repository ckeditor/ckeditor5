/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon-toolbar/balloontoolbareditor
 */

import StandardEditor from '@ckeditor/ckeditor5-core/src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';
import BalloonToolbarEditorUI from './balloontoolbareditorui';
import BalloonToolbarEditorUIView from './balloontoolbareditoruiview';

import '../theme/theme.scss';

/**
 * The balloon toolbar editor. Uses an inline editable and a toolbar based
 * on the {@link module:ui/toolbar/contextual/contextualtoolbar~ContextualToolbar}.
 *
 * @extends module:core/editor/standardeditor~StandardEditor
 */
export default class BalloonToolbarEditor extends StandardEditor {
	/**
	 * Creates an instance of the balloon toolbar editor.
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
		this.ui = new BalloonToolbarEditorUI( this, new BalloonToolbarEditorUIView( this.locale, element ) );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		this.updateEditorElement();

		return this.ui.destroy()
			.then( () => super.destroy() );
	}

	/**
	 * Creates a balloon toolbar editor instance.
	 *
	 *		BalloonToolbarEditor.create( document.querySelector( '#editor' ), {
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
