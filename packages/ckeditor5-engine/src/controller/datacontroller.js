/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/datacontroller
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

import Mapper from '../conversion/mapper';

import ModelConversionDispatcher from '../conversion/modelconversiondispatcher';
import { insertText } from '../conversion/model-to-view-converters';

import ViewConversionDispatcher from '../conversion/viewconversiondispatcher';
import { convertText, convertToModelFragment } from '../conversion/view-to-model-converters';

import ViewDocumentFragment from '../view/documentfragment';
import ViewDocument from '../view/document';
import ViewWriter from '../view/writer';

import ModelRange from '../model/range';

/**
 * Controller for the data pipeline. The data pipeline controls how data is retrieved from the document
 * and set inside it. Hence, the controller features two methods which allow to {@link ~DataController#get get}
 * and {@link ~DataController#set set} data of the {@link ~DataController#model model}
 * using the given:
 *
 * * {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor},
 * * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher model to view} and
 * * {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher view to model} converters.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class DataController {
	/**
	 * Creates a data controller instance.
	 *
	 * @param {module:engine/model/model~Model} model Data model.
	 * @param {module:engine/dataprocessor/dataprocessor~DataProcessor} [dataProcessor] Data processor that should be used
	 * by the controller.
	 */
	constructor( model, dataProcessor ) {
		/**
		 * Data model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * Data processor used during the conversion.
		 *
		 * @readonly
		 * @member {module:engine/dataProcessor~DataProcessor}
		 */
		this.processor = dataProcessor;

		/**
		 * Mapper used for the conversion. It has no permanent bindings, because they are created when getting data and
		 * cleared directly after the data are converted. However, the mapper is defined as a class property, because
		 * it needs to be passed to the `ModelConversionDispatcher` as a conversion API.
		 *
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Model-to-view conversion dispatcher used by the {@link #get get method}.
		 * To attach the model-to-view converter to the data pipeline you need to add a listener to this property:
		 *
		 *		data.modelToView( 'insert:$element', customInsertConverter );
		 *
		 * Or use {@link module:engine/conversion/buildmodelconverter~ModelConverterBuilder}:
		 *
		 *		buildModelConverter().for( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );
		 *
		 * @readonly
		 * @member {module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}
		 */
		this.modelToView = new ModelConversionDispatcher( this.model, {
			mapper: this.mapper
		} );
		this.modelToView.on( 'insert:$text', insertText(), { priority: 'lowest' } );

		/**
		 * View-to-model conversion dispatcher used by the {@link #set set method}.
		 * To attach the view-to-model converter to the data pipeline you need to add a listener to this property:
		 *
		 *		data.viewToModel( 'element', customElementConverter );
		 *
		 * Or use {@link module:engine/conversion/buildviewconverter~ViewConverterBuilder}:
		 *
		 *		buildViewConverter().for( data.viewToModel ).fromElement( 'b' ).toAttribute( 'bold', 'true' );
		 *
		 * @readonly
		 * @member {module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher}
		 */
		this.viewToModel = new ViewConversionDispatcher( this.model, {
			schema: model.schema
		} );

		// Define default converters for text and elements.
		//
		// Note that if there is no default converter for the element it will be skipped, for instance `<b>foo</b>` will be
		// converted to nothing. We add `convertToModelFragment` as a last converter so it converts children of that
		// element to the document fragment so `<b>foo</b>` will be converted to `foo` if there is no converter for `<b>`.
		this.viewToModel.on( 'text', convertText(), { priority: 'lowest' } );
		this.viewToModel.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
		this.viewToModel.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );
	}

	/**
	 * Returns the model's data converted by the {@link #modelToView model-to-view converters} and
	 * formatted by the {@link #processor data processor}.
	 *
	 * @param {String} [rootName='main'] Root name.
	 * @returns {String} Output data.
	 */
	get( rootName = 'main' ) {
		// Get model range.
		return this.stringify( this.model.document.getRoot( rootName ) );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model's element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the
	 * {@link #modelToView model-to-view converters} and formatted by the
	 * {@link #processor data processor}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} modelElementOrFragment
	 * Element whose content will be stringified.
	 * @returns {String} Output data.
	 */
	stringify( modelElementOrFragment ) {
		// Model -> view.
		const viewDocumentFragment = this.toView( modelElementOrFragment );

		// View -> data.
		return this.processor.toData( viewDocumentFragment );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the
	 * {@link #modelToView model-to-view converters} to a
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} modelElementOrFragment
	 * Element or document fragment whose content will be converted.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} Output view DocumentFragment.
	 */
	toView( modelElementOrFragment ) {
		// First, convert elements.
		const modelRange = ModelRange.createIn( modelElementOrFragment );

		const viewDocumentFragment = new ViewDocumentFragment();
		const viewWriter = new ViewWriter( new ViewDocument() );
		this.mapper.bindElements( modelElementOrFragment, viewDocumentFragment );

		this.modelToView.convertInsert( modelRange, viewWriter );

		if ( !modelElementOrFragment.is( 'documentFragment' ) ) {
			// Then, if a document element is converted, convert markers.
			// From all document markers, get those, which "intersect" with the converter element.
			const markers = _getMarkersRelativeToElement( modelElementOrFragment );

			for ( const [ name, range ] of markers ) {
				this.modelToView.convertMarkerAdd( name, range, viewWriter );
			}
		}

		// Clear bindings so the next call to this method gives correct results.
		this.mapper.clearBindings();

		return viewDocumentFragment;
	}

	/**
	 * Sets input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #viewToModel view-to-model converters}.
	 *
	 * This method also creates a batch with all the changes applied. If all you need is to parse data, use
	 * the {@link #parse} method.
	 *
	 * @param {String} data Input data.
	 * @param {String} [rootName='main'] Root name.
	 */
	set( data, rootName = 'main' ) {
		// Save to model.
		const modelRoot = this.model.document.getRoot( rootName );

		this.model.enqueueChange( 'transparent', writer => {
			// Clearing selection is a workaround for ticket #569 (LiveRange loses position after removing data from document).
			// After fixing it this code should be removed.
			writer.setSelection( null );
			writer.removeSelectionAttribute( this.model.document.selection.getAttributeKeys() );

			writer.remove( ModelRange.createIn( modelRoot ) );
			writer.insert( this.parse( data ), modelRoot );
		} );
	}

	/**
	 * Returns data parsed by the {@link #processor data processor} and then
	 * converted by the {@link #viewToModel view-to-model converters}.
	 *
	 * @see #set
	 * @param {String} data Data to parse.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context=['$root']] Base context in which the view will
	 * be converted to the model. See: {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Parsed data.
	 */
	parse( data, context = [ '$root' ] ) {
		// data -> view
		const viewDocumentFragment = this.processor.toView( data );

		// view -> model
		return this.toModel( viewDocumentFragment, context );
	}

	/**
	 * Returns the result of the given {@link module:engine/view/element~Element view element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment} converted by the
	 * {@link #viewToModel view-to-model converters}, wrapped by {module:engine/model/documentfragment~DocumentFragment}.
	 *
	 * When marker elements were converted during the conversion process, it will be set as a DocumentFragment's
	 * {@link module:engine/model/documentfragment~DocumentFragment#markers static markers map}.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewElementOrFragment
	 * Element or document fragment whose content will be converted.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context=['$root']] Base context in which the view will
	 * be converted to the model. See: {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Output document fragment.
	 */
	toModel( viewElementOrFragment, context = [ '$root' ] ) {
		return this.viewToModel.convert( viewElementOrFragment, context );
	}

	/**
	 * Removes all event listeners set by the DataController.
	 */
	destroy() {}
}

mix( DataController, ObservableMixin );

// Helper function for converting part of a model to view.
//
// Takes a document element (element that is added to a model document) and checks which markers are inside it
// and which markers are containing it. If the marker is intersecting with element, the intersection is returned.
function _getMarkersRelativeToElement( element ) {
	const result = [];
	const doc = element.root.document;

	if ( !doc ) {
		return [];
	}

	const elementRange = ModelRange.createIn( element );

	for ( const marker of doc.model.markers ) {
		const intersection = elementRange.getIntersection( marker.getRange() );

		if ( intersection ) {
			result.push( [ marker.name, intersection ] );
		}
	}

	return result;
}
