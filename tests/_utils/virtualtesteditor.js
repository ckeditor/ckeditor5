/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor/editor.js';
import VirtualEditingController from './virtualeditingcontroller.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

/**
 * A simple editor implementation which features a {@link tests.ckeditor5._utils.VirtualEditingController}.
 * Useful for testing engine parts of features.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.ckeditor5._utils
 */
export default class VirtualTestEditor extends Editor {
	constructor( config ) {
		super( config );

		this.editing = new VirtualEditingController( this.document );
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
}
