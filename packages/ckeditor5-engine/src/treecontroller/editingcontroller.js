/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Mapper from './mapper.js';
import ModelConversionDispatcher from './modelconversiondispatcher.js';
import { insertText, remove, move } from './model-to-view.js';

import TreeView from '../treview/treview.js';

export default class EditingController {
	constructor( modelDocument ) {
		this.model = modelDocument;

		this.mapper = new Mapper();
		this.view = new TreeView();

		this.toView = new ModelConversionDispatcher( {
			writer: this.view.writer,
			mapper: this.mapper
		} );

		this.model.on( 'change', ( evt, type, changeInfo ) => {
			this.toView.convertChange( type, changeInfo );
		} );

		this.toView.on( 'insert:text', insertText() );
		this.toView.on( 'remove', remove() );
		this.toView.on( 'move', move() );
	}

	createRoot( element, name ) {
		const viewRoot = this.view.createRoot( element, name );
		const modelRoot = this.model.createRoot( name );

		this.mapper.bindElements( modelRoot, viewRoot );
	}
}
