/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export default class DataController {
	constructor( modelDocument, dataProcessor ) {
		this.model = modelDocument;

		this.mapper = new Mapper();
		this.writer = new Writer();

		this.toView = new ModelConversionDispatcher( {
			writer: this.writer,
			mapper: this.mapper
		} );

		this.domConverter = new DomConverter();
		this.dataProcessor = dataProcessor;

		toView.on( 'insert:text', insertText() );
	}

	getData( rootName ) {
		// Get model range
		const modelRootElement = this.model.getRoot( rootName );
		const modelRange = ModelRange.createFromElement( rootElement );

		// model -> view
		const viewElement = new ViewElement(); // ViewDocumentFragment?
		this.mapper.bindElements( modelRootElement, viewElement );

		this.toView.convertInsert( modelRange );

		this.mapper.unbindElements( modelRootElement, viewElement );

		// view -> DOM
		const domElement = domConverter.viewToDom( viewElement, document ); // TODO new document

		domDocumentFragment = domElement; // TODO

		// DOM -> data
		return dataProcessor.toData( domDocumentFragment );
	}

	setData( data, rootName ) {
	}
}
