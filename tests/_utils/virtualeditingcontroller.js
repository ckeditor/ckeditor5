/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';

/**
 * A simplified {@link engine.EditingController editing controller} which should be enough
 * to test engine part of features.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.ckeditor5._utils
 */
export default class VirtualEditingController {
	constructor( model ) {
		this.model = model;

		this.view = new ViewDocument();

		this.modelToView = new ModelConversionDispatcher( {
			writer: this.view.writer,
			mapper: this.mapper,
			viewSelection: this.view.selection
		} );
	}
}
