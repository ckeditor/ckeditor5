/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../../src/editor/editor';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

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

		// Use the HTML data processor in this editor.
		this.data.processor = new HtmlDataProcessor();

		// Disable editing pipeline.
		this.editing.destroy();

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	/**
	 * Creates a virtual, element-less editor instance.
	 *
	 * @param {Object} config See {@link core.editor.Editor}'s param.
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

mix( ModelTestEditor, DataApiMixin );
