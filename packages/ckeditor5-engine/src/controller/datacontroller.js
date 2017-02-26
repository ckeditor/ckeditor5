/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/datacontroller
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

import Mapper from '../conversion/mapper';

import ModelConversionDispatcher from '../conversion/modelconversiondispatcher';
import { insertText } from '../conversion/model-to-view-converters';

import ViewConversionDispatcher from '../conversion/viewconversiondispatcher';
import { convertText, convertToModelFragment } from '../conversion/view-to-model-converters';

import ViewDocumentFragment from '../view/documentfragment';

import ModelRange from '../model/range';
import ModelPosition from '../model/position';
import ModelTreeWalker from '../model/treewalker';

import insertContent from './insertcontent';
import deleteContent from './deletecontent';
import modifySelection from './modifyselection';
import getSelectedContent from './getselectedcontent';

import { remove } from '../model/writer';

/**
 * Controller for the data pipeline. The data pipeline controls how data is retrieved from the document
 * and set inside it. Hence, the controller features two methods which allow to {@link ~DataController#get get}
 * and {@link ~DataController#set set} data of the {@link ~DataController#model model}
 * using given:
 *
 * * {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor},
 * * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher model to view} and
 * * {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher view to model} converters.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class DataController {
	/**
	 * Creates data controller instance.
	 *
	 * @param {module:engine/model/document~Document} model Document model.
	 * @param {module:engine/dataprocessor/dataprocessor~DataProcessor} [dataProcessor] Data processor which should used by the controller.
	 */
	constructor( model, dataProcessor ) {
		/**
		 * Document model.
		 *
		 * @readonly
		 * @member {module:engine/model/document~Document}
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
		 * cleared directly after data are converted. However, the mapper is defined as class property, because
		 * it needs to be passed to the `ModelConversionDispatcher` as a conversion API.
		 *
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Model to view conversion dispatcher used by the {@link #get get method}.
		 * To attach model to view converter to the data pipeline you need to add lister to this property:
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
		 * View to model conversion dispatcher used by the {@link #set set method}.
		 * To attach view to model converter to the data pipeline you need to add lister to this property:
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
		this.viewToModel = new ViewConversionDispatcher( {
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

		this.on( 'insertContent', ( evt, data ) => insertContent( this, data.content, data.selection, data.batch ) );
		this.on( 'deleteContent', ( evt, data ) => deleteContent( data.selection, data.batch, data.options ) );
		this.on( 'modifySelection', ( evt, data ) => modifySelection( this, data.selection, data.options ) );
		this.on( 'getSelectedContent', ( evt, data ) => {
			data.content = getSelectedContent( data.selection );
		} );
	}

	/**
	 * Returns model's data converted by the {@link #modelToView model to view converters} and
	 * formatted by the {@link #processor data processor}.
	 *
	 * @param {String} [rootName='main'] Root name.
	 * @returns {String} Output data.
	 */
	get( rootName = 'main' ) {
		// Get model range.
		return this.stringify( this.model.getRoot( rootName ) );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model's element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the
	 * {@link #modelToView model to view converters} and formatted by the
	 * {@link #processor data processor}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} modelElementOrFragment
	 * Element which content will be stringified.
	 * @returns {String} Output data.
	 */
	stringify( modelElementOrFragment ) {
		// model -> view
		const viewDocumentFragment = this.toView( modelElementOrFragment );

		// view -> data
		return this.processor.toData( viewDocumentFragment );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the
	 * {@link #modelToView model to view converters} to a
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} modelElementOrFragment
	 * Element or document fragment which content will be converted.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} Output view DocumentFragment.
	 */
	toView( modelElementOrFragment ) {
		const modelRange = ModelRange.createIn( modelElementOrFragment );

		const viewDocumentFragment = new ViewDocumentFragment();
		this.mapper.bindElements( modelElementOrFragment, viewDocumentFragment );

		this.modelToView.convertInsertion( modelRange );

		this.mapper.clearBindings();

		return viewDocumentFragment;
	}

	/**
	 * Sets input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #viewToModel view to model converters}. When markers where converted
	 * from view to model as temporary {@link module:engine/model/element/~Element model elements} then those element
	 * will be removed from parsed {@link module:engine/model/element/~DocumentFragment} and added to the
	 * {@link module:engine/model/document~Document#markers markers collection}.
	 *
	 * This method also creates a batch with all the changes applied. If all you need is to parse data use
	 * the {@link #parse} method.
	 *
	 * @param {String} data Input data.
	 * @param {String} [rootName='main'] Root name.
	 */
	set( data, rootName = 'main' ) {
		// Save to model.
		const modelRoot = this.model.getRoot( rootName );

		this.model.enqueueChanges( () => {
			// Clearing selection is a workaround for ticket #569 (LiveRange loses position after removing data from document).
			// After fixing it this code should be removed.
			this.model.selection.removeAllRanges();
			this.model.selection.clearAttributes();

			// Parse data to model and extract markers from parsed document fragment.
			const { documentFragment, markersData } = extractMarkersFromModelFragment( this.parse( data ) );

			// Initial batch should be ignored by features like undo, etc.
			const batch = this.model.batch( 'transparent' );

			// Replace current editor data by the new one.
			batch
				.remove( ModelRange.createIn( modelRoot ) )
				.insert( ModelPosition.createAt( modelRoot, 0 ), documentFragment );

			// Add markers to the document.
			for ( const marker of markersData ) {
				const markerName = marker[ 0 ];
				const markerData = marker[ 1 ];
				const range = new ModelRange(
					new ModelPosition( modelRoot, markerData.startPath ),
					markerData.endPath ? new ModelPosition( modelRoot, markerData.endPath ) : null
				);

				batch.setMarker( this.model.markers.set( markerName, range ) );
			}
		} );
	}

	/**
	 * Returns data parsed by the {@link #processor data processor} and then
	 * converted by the {@link #viewToModel view to model converters}.
	 *
	 * @see #set
	 * @param {String} data Data to parse.
	 * @param {String} [context='$root'] Base context in which the view will be converted to the model. See:
	 * {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Parsed data.
	 */
	parse( data, context = '$root' ) {
		// data -> view
		const viewDocumentFragment = this.processor.toView( data );

		// view -> model
		return this.toModel( viewDocumentFragment, context );
	}

	/**
	 * Returns the content of the given {@link module:engine/view/element~Element view element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment} converted by the
	 * {@link #viewToModel view to model converters} to a
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment}.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewElementOrFragment
	 * Element or document fragment which content will be converted.
	 * @param {String} [context='$root'] Base context in which the view will be converted to the model. See:
	 * {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Output document fragment.
	 */
	toModel( viewElementOrFragment, context = '$root' ) {
		return this.viewToModel.convert( viewElementOrFragment, { context: [ context ] } );
	}

	/**
	 * Removes all event listeners set by the DataController.
	 */
	destroy() {}

	/**
	 * See {@link module:engine/controller/insertcontent~insertContent}.
	 *
	 * Note that data inserted by a data pipeline might contain temporary {@link module:engine/model/element/~Element elements}
	 * marking {@link module:engine/model/document~Document#markers markers} ranges. We need to remove them because
	 * data pipeline allows to set markers only by a {@link #set set method}.
	 *
	 * @fires insertContent
	 * @param {module:engine/model/documentfragment~DocumentFragment} content The content to insert.
	 * @param {module:engine/model/selection~Selection} selection Selection into which the content should be inserted.
	 * @param {module:engine/model/batch~Batch} [batch] Batch to which deltas will be added. If not specified, then
	 * changes will be added to a new batch.
	 */
	insertContent( content, selection, batch ) {
		const { documentFragment } = extractMarkersFromModelFragment( content );
		this.fire( 'insertContent', { content: documentFragment, selection, batch } );
	}

	/**
	 * See {@link module:engine/controller/deletecontent~deleteContent}.
	 *
	 * Note: For the sake of predictability, the resulting selection should always be collapsed.
	 * In cases where a feature wants to modify deleting behavior so selection isn't collapsed
	 * (e.g. a table feature may want to keep row selection after pressing <kbd>Backspace</kbd>),
	 * then that behavior should be implemented in the view's listener. At the same time, the table feature
	 * will need to modify this method's behavior too, e.g. to "delete contents and then collapse
	 * the selection inside the last selected cell" or "delete the row and collapse selection somewhere near".
	 * That needs to be done in order to ensure that other features which use `deleteContent()` will work well with tables.
	 *
	 * @fires deleteContent
	 * @param {module:engine/model/selection~Selection} selection Selection of which the content should be deleted.
	 * @param {module:engine/model/batch~Batch} batch Batch to which deltas will be added.
	 * @param {Object} options See {@link module:engine/controller/deletecontent~deleteContent}'s options.
	 */
	deleteContent( selection, batch, options ) {
		this.fire( 'deleteContent', { batch, selection, options } );
	}

	/**
	 * See {@link module:engine/controller/modifyselection~modifySelection}.
	 *
	 * @fires modifySelection
	 * @param {module:engine/model/selection~Selection} selection The selection to modify.
	 * @param {Object} options See {@link module:engine/controller/modifyselection~modifySelection}'s options.
	 */
	modifySelection( selection, options ) {
		this.fire( 'modifySelection', { selection, options } );
	}

	/**
	 * See {@link module:engine/controller/getselectedcontent~getSelectedContent}.
	 *
	 * @fires module:engine/controller/datacontroller~DataController#getSelectedContent
	 * @param {module:engine/model/selection~Selection} selection The selection of which content will be retrieved.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Document fragment holding the clone of the selected content.
	 */
	getSelectedContent( selection ) {
		const evtData = { selection };

		this.fire( 'getSelectedContent', evtData );

		return evtData.content;
	}
}

mix( DataController, EmitterMixin );

// Traverses given DocumentFragment and searches elements which marks marker range. Founded element is removed from
// DocumentFragment but path of this element is stored in Map.
//
// @param {module:engine/view/documentfragment~DocumentFragment} documentFragment Model DocumentFragment.
// @returns {Object} Object with markers data and cleaned up document fragment.
function extractMarkersFromModelFragment( documentFragment ) {
	const markersData = new Map();

	// Creates ModelTreeWalker with given start position.
	function walkFrom( position ) {
		const walker = new ModelTreeWalker( {
			startPosition: position,
			ignoreElementEnd: true,
			shallow: false
		} );

		// Walk through DocumentFragment.
		for ( const value of walker ) {
			// Check if current element is a marker stamp.
			if ( value.item.name == '$marker' ) {
				const markerName = value.item.getAttribute( 'data-name' );
				const currentPosition = ModelPosition.createBefore( value.item );

				// When marker of given name is not stored it means that we have found the beginning of the range.
				if ( !markersData.has( markerName ) ) {
					markersData.set( markerName, { startPath: currentPosition.path } );
				// Otherwise is means that we have found end of the marker range.
				} else {
					markersData.get( markerName ).endPath = currentPosition.path;
				}

				// Remove marker stamp element from DocumentFragment.
				remove( ModelRange.createOn( value.item ) );

				// Keep walking using new instance of TreeWalker but starting from last visited position.
				// This is because after removing marker stamp element DocumentFragment structure might change
				// and TreeWalker might omit some node.
				walkFrom( currentPosition );

				// Stop this walker, we have continued walk using new TreeWalker instance.
				break;
			}
		}
	}

	// Start traversing.
	walkFrom( ModelPosition.createAt( documentFragment, 0 ) );

	return { markersData, documentFragment };
}

/**
 * Event fired when {@link #insertContent} method is called.
 * The {@link #insertContent default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @event insertContent
 * @param {Object} data
 * @param {module:engine/view/documentfragment~DocumentFragment} data.content The content to insert.
 * @param {module:engine/model/selection~Selection} data.selection Selection into which the content should be inserted.
 * @param {module:engine/model/batch~Batch} [data.batch] Batch to which deltas will be added.
 */

/**
 * Event fired when {@link #deleteContent} method is called.
 * The {@link module:engine/controller/deletecontent~deleteContent default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @event deleteContent
 * @param {Object} data
 * @param {module:engine/model/batch~Batch} data.batch
 * @param {module:engine/model/selection~Selection} data.selection
 * @param {Object} data.options See {@link module:engine/controller/deletecontent~deleteContent}'s options.
 */

/**
 * Event fired when {@link #modifySelection} method is called.
 * The {@link module:engine/controller/modifyselection~modifySelection default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @event modifySelection
 * @param {Object} data
 * @param {module:engine/model/selection~Selection} data.selection
 * @param {Object} data.options See {@link module:engine/controller/modifyselection~modifySelection}'s options.
 */

/**
 * Event fired when {@link module:engine/controller/datacontroller~DataController#getSelectedContent} method is called.
 * The {@link module:engine/controller/getselectedcontent~getSelectedContent default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @event module:engine/controller/datacontroller~DataController#getSelectedContent
 * @param {Object} data
 * @param {module:engine/model/selection~Selection} data.selection
 * @param {module:engine/model/documentfragment~DocumentFragment} data.content The document fragment to return
 * (holding a clone of the selected content).
 */
