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

/**
 * Data pipeline controlling class. The main usage for this class is to let user {@link engine.DataController#get get}
 * and {@link engine.DataController#set set} data of the {@link engine.DataController#model model}
 * using given {@link engine.dataProcessor.DataProcessor DataProcessor} and
 * {@link engine.treeController.ModelConversionDispatcher model to view} and
 * {@link engine.treeController.ViewConversionDispatcher view to model} converters.
 *
 * @memberOf engine
 */
export default class DataController {
	/**
	 * Creates data controller instance for {@link engine.DataController#get getting} data from and
	 * {@link engine.DataController#set setting} data to the given {@link engine.treeModel.document document model},
	 * using given {@link engine.dataProcessor.DataProcessor DataProcessor}.
	 *
	 * @param {engine.treeModel.Document} modelDocument Controlled model document.
	 * @param {engine.dataProcessor.DataProcessor} dataProcessor Data processor which should used by the controller.
	 */
	constructor( modelDocument, dataProcessor ) {
		/**
		 * Controlled model document.
		 *
		 * @readonly
		 * @member {engine.treeModel.document} engine.DataController#model
		 */
		this.model = modelDocument;

		/**
		 * DataProcessor used during the conversion.
		 *
		 * @readonly
		 * @member {engine.dataProcessor.DataProcessor} engine.DataController#processor
		 */
		this.processor = dataProcessor;

		/**
		 * Mapper used for the conversion. In has no permanent bindings, because they are created on getting data and cleared
		 * directly after data are converted. However, the mapper is defined as class property, because it need to be
		 * passed to the `ModelConversionDispatcher` as a conversion API.
		 *
		 * @private
		 * @member {engine.treeController.Mapper} engine.DataController#_mapper
		 */
		this._mapper = new Mapper();

		/**
		 * Writer used during the conversion.
		 *
		 * @private
		 * @member {engine.treeView.Writer} engine.DataController#_writer
		 */
		this._writer = new Writer();

		/**
		 * DomConverter used during the conversion.
		 *
		 * @private
		 * @member {engine.treeView.DomConverter} engine.DataController#_domConverter
		 */
		this._domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );

		/**
		 * Model to view conversion dispatcher used by the {@link engine.DataController#get get method}.
		 * To attach model to view converter to the data pipeline you need to add lister to this property:
		 *
		 *		data.modelToView( 'insert:$element', customInsertConverter );
		 *
		 * Or use {@link engine.treeController.ModelConverterBuilder}:
		 *
		 *		BuildModelConverterFor( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );
		 *
		 * @readonly
		 * @member {engine.treeController.ModelConversionDispatcher} engine.DataController#modelToView
		 */
		this.modelToView = new ModelConversionDispatcher( {
			writer: this._writer,
			mapper: this._mapper
		} );
		this.modelToView.on( 'insert:$text', insertText() );

		/**
		 * View to model conversion dispatcher used by the {@link engine.DataController#set set method}.
		 * To attach view to model converter to the data pipeline you need to add lister to this property:
		 *
		 *		data.viewToModel( 'element', customElementConverter );
		 *
		 * Or use {@link engine.treeController.ViewConverterBuilder}:
		 *
		 *		BuildViewConverterFor( data.viewToModel ).fromElement( 'b' ).toAttribute( 'bold', true );
		 *
		 * @readonly
		 * @member {engine.treeController.ViewConversionDispatcher} engine.DataController#viewToModel
		 */
		this.viewToModel = new ViewConversionDispatcher( {
			schema: modelDocument.schema
		} );
		this.viewToModel.on( 'text', convertText() );
		this.viewToModel.on( 'element', convertToModelFragment(), null, 9999 );
		this.viewToModel.on( 'documentFragment', convertToModelFragment(), null, 9999 );
	}

	/**
	 * Returns model data converted by {@link engine.DataController#modelToView model to view converters} and
	 * formated by the {@link engine.DataController#processor data processor}.
	 *
	 * @param {String} [rootName='main'] Root name.
	 * @returns {String} Output data.
	 */
	get( rootName = 'main' ) {
		// Get model range
		const modelRoot = this.model.getRoot( rootName );
		const modelRange = ModelRange.createFromElement( modelRoot );

		// model -> view
		const viewDocumentFragment = new ViewDocumentFragment();
		this._mapper.bindElements( modelRoot, viewDocumentFragment );

		this.modelToView.convertInsert( modelRange );

		this._mapper.clearBindings();

		// view -> DOM
		const domDocumentFragment = this._domConverter.viewToDom( viewDocumentFragment, document );

		// DOM -> data
		return this.processor.toData( domDocumentFragment );
	}

	/**
	 * Sets input data parsed by the {@link engine.DataController#processor data processor} and
	 * converted by {@link engine.DataController#viewToModel view to model converters}.
	 *
	 * This method also creates a batch with applied changes. If all you need is to parse data use
	 * {@link engine.dataController#parse}.
	 *
	 * @param {String} [rootName='main'] Roots name.
	 * @param {String} data Input data.
	 */
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

	/**
	 * Returns data parsed by the {@link engine.DataController#processor data processor} and then
	 * converted by {@link engine.DataController#viewToModel view to model converters}.
	 *
	 * @see engine.dataController#set
	 * @param {String} data Data to parse.
	 * @returns {engine.treeModel.DocumentFragment} Parsed data.
	 */
	parse( data ) {
		// data -> DOM
		const domDocumentFragment = this.processor.toDom( data );

		// DOM -> view
		const viewDocumentFragment = this._domConverter.domToView( domDocumentFragment );

		// view -> model
		const modelDocumentFragment = this.viewToModel.convert( viewDocumentFragment, { context: [ '$root' ] } );

		return modelDocumentFragment;
	}

	/**
	 * Removes all events listeners set by the DataController.
	 */
	destroy() {}
}
