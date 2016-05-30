/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor/editor.js';
import VirtualEditingController from './virtualeditingcontroller.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

export default class VirtualTestEditor extends Editor {
	constructor( config ) {
		super( config );

		this.editing = new VirtualEditingController( this.document );
		this.data.processor = new HtmlDataProcessor();
	}

	setData( data ) {
		this.data.set( data );
	}

	getData() {
		return this.data.get();
	}
}
