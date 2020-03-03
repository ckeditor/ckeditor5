/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
		this.data.processor = new HtmlDataProcessor( this.editing.view.document );

		// Disable editing pipeline.
		this.editing.destroy();

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	static create( config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						// Fire `data#ready` event manually as `data#init()` method is not used.
						editor.data.fire( 'ready' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

mix( ModelTestEditor, DataApiMixin );
