/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Mapper from './treecontroller/mapper.js';
import ModelConversionDispatcher from './treecontroller/modelconversiondispatcher.js';
import ViewConversionController from './treecontroller/viewconversioncontroller.js';
import { insertText } from './treecontroller/model-to-view.js';
import { convertText, convertChildren } from './treecontroller/view-to-model.js';

import Writer from './treview/writer.js';
import ViewDocumentFragment from './treview/documentfragment.js';
import DomConverter from './treview/domconverter.js';

import ModelRange from './treemodel/range.js';

export default class DataController {
	constructor( modelDocument, dataProcessor ) {
		this.model = modelDocument;

		this.mapper = new Mapper();

		this.writer = new Writer();

		this.domConverter = new DomConverter();

		this.processor = dataProcessor;

		this.toView = new ModelConversionDispatcher( {
			writer: this.writer,
			mapper: this.mapper
		} );
		this.toView.on( 'insert:text', insertText() );

		this.toModel = new ViewConversionController();
		this.toModel.on( 'text', convertText() );
		this.toModel.on( 'element', convertChildren(), 9999 );
		this.toModel.on( 'documentFragment', convertChildren(), 9999 );
	}

	get( rootName = 'main' ) {
		// Get model range
		const modelRootElement = this.model.getRoot( rootName );
		const modelRange = ModelRange.createFromElement( modelRootElement );

		// model -> view
		const viewDocumentFragment = new ViewDocumentFragment();
		this.mapper.bindElements( modelRootElement, viewDocumentFragment );

		this.toView.convertInsert( modelRange );

		this.mapper.unbindElements( modelRootElement, viewDocumentFragment );

		// view -> DOM
		const domDocumentFragment = this.domConverter.viewToDom( viewDocumentFragment, document );

		// DOM -> data
		return this.processor.toData( domDocumentFragment );
	}

	set( data, rootName ) {
		// data -> DOM
		const domDocumentFragment = this.processor.toDom( data );

		// DOM -> view
		const viewDocumentFragment = this.domConverter.domToView( domDocumentFragment );

		// view -> model
		const modelDocumentFragment = this.toModel.convert( viewDocumentFragment );

		// Save to model
		const modelRoot = this.model.getRoot( rootName );

		this.model.batch()
			.removeChildren( 0, modelRoot.getChildCount() )
			.appendChildren( modelRoot, modelDocumentFragment );
	}

	destroy() {}
}
