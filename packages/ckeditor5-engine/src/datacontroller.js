/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Mapper from './treecontroller/mapper.js';

import ModelConversionDispatcher from './treecontroller/modelconversiondispatcher.js';
import { insertText } from './treecontroller/model-to-view-converters.js';

import ViewConversionDispatcher from './treecontroller/viewconversiondispatcher.js';
import { convertText, convertToModelFragment } from './treecontroller/view-to-model-converters.js';

import Writer from './treeview/writer.js';
import ViewDocumentFragment from './treeview/documentfragment.js';
import DomConverter from './treeview/domconverter.js';
import { NBSP_FILLER } from './treeview/filler.js';

import ModelRange from './treemodel/range.js';
import ModelPosition from './treemodel/position.js';

export default class DataController {
	constructor( modelDocument, dataProcessor ) {
		this.model = modelDocument;

		this._mapper = new Mapper();

		this._writer = new Writer();

		this._domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );

		this._processor = dataProcessor;

		this.toView = new ModelConversionDispatcher( {
			writer: this._writer,
			mapper: this._mapper
		} );
		this.toView.on( 'insert:$text', insertText() );

		this.toModel = new ViewConversionDispatcher( {
			schema: modelDocument.schema
		} );
		this.toModel.on( 'text', convertText() );
		this.toModel.on( 'element', convertToModelFragment(), null, 9999 );
		this.toModel.on( 'documentFragment', convertToModelFragment(), null, 9999 );
	}

	get( rootName = 'main' ) {
		// Get model range
		const modelRoot = this.model.getRoot( rootName );
		const modelRange = ModelRange.createFromElement( modelRoot );

		// model -> view
		const viewDocumentFragment = new ViewDocumentFragment();
		this._mapper.bindElements( modelRoot, viewDocumentFragment );

		this.toView.convertInsert( modelRange );

		this._mapper.clearBindings();

		// view -> DOM
		const domDocumentFragment = this._domConverter.viewToDom( viewDocumentFragment, document );

		// DOM -> data
		return this._processor.toData( domDocumentFragment );
	}

	set( rootName, data ) {
		if ( !data ) {
			data = rootName;
			rootName = 'main';
		}

		// Save to model
		const modelRoot = this.model.getRoot( rootName );

		this.model.batch()
			.remove( ModelRange.createFromElement( modelRoot ) )
			.insert( ModelPosition.createAt( modelRoot, 0 ), this.parse( data ) );
	}

	parse( data ) {
		// data -> DOM
		const domDocumentFragment = this._processor.toDom( data );

		// DOM -> view
		const viewDocumentFragment = this._domConverter.domToView( domDocumentFragment );

		// view -> model
		const modelDocumentFragment = this.toModel.convert( viewDocumentFragment, { context: [ '$root' ] } );

		return modelDocumentFragment;
	}

	destroy() {}
}
