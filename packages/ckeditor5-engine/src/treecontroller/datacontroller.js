/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Mapper from './mapper.js';
import ModelConversionDispatcher from './modelconversiondispatcher.js';
import ViewConversionController from './viewconversioncontroller.js';
import { insertText } from './model-to-view.js';

import Writer from '../treview/writer.js';
import ViewElement from '../treview/element.js';
import DomConverter from '../treview/domconverter.js';

import ModelRange from '../treemodel/range.js';

export default class DataController {
	constructor( modelDocument, dataProcessor ) {
		this.model = modelDocument;

		this.mapper = new Mapper();
		this.writer = new Writer();

		this.toView = new ModelConversionDispatcher( {
			writer: this.writer,
			mapper: this.mapper
		} );

		this.toModel = new ViewConversionController();

		this.domConverter = new DomConverter();
		this.dataProcessor = dataProcessor;

		this.toView.on( 'insert:text', insertText() );
	}

	get( rootName ) {
		// Get model range
		const modelRootElement = this.model.getRoot( rootName );
		const modelRange = ModelRange.createFromElement( modelRootElement );

		// model -> view
		const viewElement = new ViewElement(); // ViewDocumentFragment?
		this.mapper.bindElements( modelRootElement, viewElement );

		this.toView.convertInsert( modelRange );

		this.mapper.unbindElements( modelRootElement, viewElement );

		// view -> DOM
		const domElement = this.domConverter.viewToDom( viewElement, document ); // TODO new document

		const domDocumentFragment = domElement; // TODO

		// DOM -> data
		return this.dataProcessor.toData( domDocumentFragment );
	}

	set( data, rootName ) {
		// data -> DOM
		const domDocumentFragment = this.dataProcessor.toDom( data );

		// view -> DOM
		const viewDocumentFragment = this.domConverter.domToView( domDocumentFragment );

		// view	-> model
		this.fire( 'view', viewDocumentFragment ); // ?

		const modelNodeList = this.toModel.convert( viewDocumentFragment );

		this.fire( 'model', modelNodeList ); // ?

		// Save to model
		const modelRoot = this.model.getRoot( rootName );

		this.model.batch()
			.removeChildren( 0, modelRoot.getChildCount() )
			.appendChildren( modelRoot, rootName );
	}
}
