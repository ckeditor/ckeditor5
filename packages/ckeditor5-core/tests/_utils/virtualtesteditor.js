/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../../src/editor/editor';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * A simple editor implementation useful for testing the engine part of the features.
 * It contains full data pipepilne and the engine pipeline but without rendering to DOM.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.core._utils
 */
export default class VirtualTestEditor extends Editor {
	constructor( config ) {
		super( config );

		// Use the HTML data processor in this editor.
		this.data.processor = new HtmlDataProcessor();

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}
}

mix( VirtualTestEditor, DataApiMixin );
