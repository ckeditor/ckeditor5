/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../../src/editor/editor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

/**
 * A simple editor implementation with a functional model part of the engine (the document).
 * It contains a full data pipeline but no editing pipeline.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.core._utils
 */
export default class ModelTestEditor extends Editor {
	constructor( config ) {
		super( config );

		this.document.createRoot();

		this.data.processor = new HtmlDataProcessor();
	}

	/**
	 * Sets the data in the editor's main root.
	 *
	 * @param {*} data The data to load.
	 */
	setData( data ) {
		this.data.set( data );
	}

	/**
	 * Gets the data from the editor's main root.
	 */
	getData() {
		return this.data.get();
	}

	/**
	 * Creates a virtual, element-less editor instance.
	 *
	 * @param {Object} config See {@link core.editor.StandardEditor}'s param.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {core.editor.VirtualTestEditor} return.editor The editor instance.
	 */
	static create( config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
