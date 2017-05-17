/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from '../../src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

/**
 * A simple editor implementation useful for testing the engine part of the features.
 * It contains full data pipepilne and the engine pipeline but without rendering to DOM.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.core._utils
 */
export default class VirtualTestEditor extends StandardEditor {
	constructor( config ) {
		super( null, config );

		this.document.createRoot();

		this.editing.createRoot( 'div' );

		this.data.processor = new HtmlDataProcessor();
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
