/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/datacontroller
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import Mapper from '../conversion/mapper';

import DowncastDispatcher from '../conversion/downcastdispatcher';
import { insertText } from '../conversion/downcast-converters';

import UpcastDispatcher from '../conversion/upcastdispatcher';
import { convertText, convertToModelFragment } from '../conversion/upcast-converters';

import ViewDocumentFragment from '../view/documentfragment';
import ViewDocument from '../view/document';
import ViewWriter from '../view/writer';

import ModelRange from '../model/range';

/**
 * Controller for the data pipeline. The data pipeline controls how data is retrieved from the document
 * and set inside it. Hence, the controller features two methods which allow to {@link ~DataController#get get}
 * and {@link ~DataController#set set} data of the {@link ~DataController#model model}
 * using given:
 *
 * * {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor},
 * * downcast converters,
 * * upcast converters.
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
		 * it needs to be passed to the `DowncastDispatcher` as a conversion API.
		 *
		 * @readonly
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Downcast dispatcher used by the {@link #get get method}. Downcast converters should be attached to it.
		 *
		 * @readonly
		 * @member {module:engine/conversion/downcastdispatcher~DowncastDispatcher}
		 */
		this.downcastDispatcher = new DowncastDispatcher( {
			mapper: this.mapper
		} );
		this.downcastDispatcher.on( 'insert:$text', insertText(), { priority: 'lowest' } );

		/**
		 * Upcast dispatcher used by the {@link #set set method}. Upcast converters should be attached to it.
		 *
		 * @readonly
		 * @member {module:engine/conversion/upcastdispatcher~UpcastDispatcher}
		 */
		this.upcastDispatcher = new UpcastDispatcher( {
			schema: model.schema
		} );

		// Define default converters for text and elements.
		//
		// Note that if there is no default converter for the element it will be skipped, for instance `<b>foo</b>` will be
		// converted to nothing. We add `convertToModelFragment` as a last converter so it converts children of that
		// element to the document fragment so `<b>foo</b>` will be converted to `foo` if there is no converter for `<b>`.
		this.upcastDispatcher.on( 'text', convertText(), { priority: 'lowest' } );
		this.upcastDispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
		this.upcastDispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

		this.decorate( 'init' );
	}

	/**
	 * Returns the model's data converted by downcast dispatchers attached to {@link #downcastDispatcher} and
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
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the downcast converters
	 * attached to {@link #downcastDispatcher} and formatted by the {@link #processor data processor}.
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
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the downcast
	 * converters attached to {@link #downcastDispatcher} to a
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

		// Create separate ViewWriter just for data conversion purposes.
		// We have no view controller and rendering do DOM in DataController so view.change() block is not used here.
		const viewWriter = new ViewWriter( new ViewDocument() );
		this.mapper.bindElements( modelElementOrFragment, viewDocumentFragment );

		this.downcastDispatcher.convertInsert( modelRange, viewWriter );

		if ( !modelElementOrFragment.is( 'documentFragment' ) ) {
			// Then, if a document element is converted, convert markers.
			// From all document markers, get those, which "intersect" with the converter element.
			const markers = _getMarkersRelativeToElement( modelElementOrFragment );

			for ( const [ name, range ] of markers ) {
				this.downcastDispatcher.convertMarkerAdd( name, range, viewWriter );
			}
		}

		// Clear bindings so the next call to this method gives correct results.
		this.mapper.clearBindings();

		return viewDocumentFragment;
	}

	/**
	 * Sets initial input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #upcastDispatcher view-to-model converters}.
	 * Initial data can be set only to document that {@link module:engine/model/document~Document#version} is equal 0.
	 *
	 * **Note** This method is {@link module:utils/observablemixin~ObservableMixin#decorate decorated} which is
	 * used by e.g. collaborative editing plugin that syncs remote data on init.
	 *
	 * @fires init
	 * @param {String} data Input data.
	 * @param {String} [rootName='main'] Root name.
	 */
	init( data, rootName = 'main' ) {
		if ( this.model.document.version ) {
			/**
			 * Cannot set initial data to not empty {@link module:engine/model/document~Document}.
			 * Initial data should be set once, during {@link module:core/editor/editor~Editor} initialization,
			 * when the {@link module:engine/model/document~Document#version} is equal 0.
			 *
			 * @error datacontroller-init-document-not-empty
			 */
			throw new CKEditorError( 'datacontroller-init-document-not-empty: Trying to set initial data to not empty document.' );
		}

		const modelRoot = this.model.document.getRoot( rootName );

		this.model.enqueueChange( 'transparent', writer => {
			writer.insert( this.parse( data, modelRoot ), modelRoot );
		} );
	}

	/**
	 * Sets input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #upcastDispatcher view-to-model converters}.
	 * This method can be used any time to replace existing editor data by the new one without clearing the
	 * {@link module:engine/model/document~Document#history document history}.
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
			writer.setSelection( null );
			writer.removeSelectionAttribute( this.model.document.selection.getAttributeKeys() );

			writer.remove( ModelRange.createIn( modelRoot ) );
			writer.insert( this.parse( data, modelRoot ), modelRoot );
		} );
	}

	/**
	 * Returns the data parsed by the {@link #processor data processor} and then converted by upcast converters
	 * attached to the {@link #upcastDispatcher}.
	 *
	 * @see #set
	 * @param {String} data Data to parse.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context='$root'] Base context in which the view will
	 * be converted to the model. See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Parsed data.
	 */
	parse( data, context = '$root' ) {
		// data -> view
		const viewDocumentFragment = this.processor.toView( data );

		// view -> model
		return this.toModel( viewDocumentFragment, context );
	}

	/**
	 * Returns the result of the given {@link module:engine/view/element~Element view element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment} converted by the
	 * {@link #upcastDispatcher view-to-model converters}, wrapped by {module:engine/model/documentfragment~DocumentFragment}.
	 *
	 * When marker elements were converted during the conversion process, it will be set as a document fragment's
	 * {@link module:engine/model/documentfragment~DocumentFragment#markers static markers map}.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewElementOrFragment
	 * Element or document fragment whose content will be converted.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context='$root'] Base context in which the view will
	 * be converted to the model. See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Output document fragment.
	 */
	toModel( viewElementOrFragment, context = '$root' ) {
		return this.model.change( writer => {
			return this.upcastDispatcher.convert( viewElementOrFragment, writer, context );
		} );
	}

	/**
	 * Removes all event listeners set by the DataController.
	 */
	destroy() {}

	/**
	 * Event fired by decorated {@link #init} method.
	 * See {@link module:utils/observablemixin~ObservableMixin.decorate} for more information and samples.
	 *
	 * @event init
	 */
}

mix( DataController, ObservableMixin );

// Helper function for downcast conversion.
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
