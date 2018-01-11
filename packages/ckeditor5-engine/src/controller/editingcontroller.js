/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/editingcontroller
 */

import RootEditableElement from '../view/rooteditableelement';
import ModelDiffer from '../model/differ';
import ViewDocument from '../view/document';
import Mapper from '../conversion/mapper';
import ModelConversionDispatcher from '../conversion/modelconversiondispatcher';
import {
	insertText,
	remove
} from '../conversion/model-to-view-converters';
import { convertSelectionChange } from '../conversion/view-selection-to-model-converters';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	clearAttributes,
	clearFakeSelection
} from '../conversion/model-selection-to-view-converters';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Controller for the editing pipeline. The editing pipeline controls {@link ~EditingController#model model} rendering,
 * including selection handling. It also creates {@link ~EditingController#view view document} which build a
 * browser-independent virtualization over the DOM elements. Editing controller also attach default converters.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class EditingController {
	/**
	 * Creates editing controller instance.
	 *
	 * @param {module:engine/model/model~Model} model Editing model.
	 */
	constructor( model ) {
		/**
		 * Editing model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * View document.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document}
		 */
		this.view = new ViewDocument();

		/**
		 * Mapper which describes model-view binding.
		 *
		 * @readonly
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Model to view conversion dispatcher, which converts changes from the model to {@link #view the editing view}.
		 *
		 * To attach model-to-view converter to the editing pipeline you need to add a listener to this dispatcher:
		 *
		 *		editing.modelToView( 'insert:$element', customInsertConverter );
		 *
		 * Or use {@link module:engine/conversion/buildmodelconverter~ModelConverterBuilder}:
		 *
		 *		buildModelConverter().for( editing.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );
		 *
		 * @readonly
		 * @member {module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher} #modelToView
		 */
		this.modelToView = new ModelConversionDispatcher( this.model, {
			mapper: this.mapper,
			viewSelection: this.view.selection
		} );

		// Model differ object. It's role is to buffer changes done on model and then calculates a diff of those changes.
		// The diff is then passed to model conversion dispatcher which generates proper events and kicks-off conversion.
		const modelDiffer = new ModelDiffer();

		// Before an operation is applied on model, buffer the change in differ.
		this.listenTo( this.model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.isDocumentOperation ) {
				modelDiffer.bufferOperation( operation );
			}
		}, { priority: 'high' } );

		// Buffer marker changes.
		// This is not covered in buffering operations because markers may change outside of them (when they
		// are modified using `model.document.markers` collection, not through `MarkerOperation`).
		this.listenTo( this.model.markers, 'add', ( evt, marker ) => {
			// Whenever a new marker is added, buffer that change.
			modelDiffer.bufferMarkerChange( marker.name, null, marker.getRange() );

			// Whenever marker changes, buffer that.
			marker.on( 'change', ( evt, oldRange ) => {
				modelDiffer.bufferMarkerChange( marker.name, oldRange, marker.getRange() );
			} );
		} );

		this.listenTo( this.model.markers, 'remove', ( evt, marker ) => {
			// Whenever marker is removed, buffer that change.
			modelDiffer.bufferMarkerChange( marker.name, marker.getRange(), null );
		} );

		// When all changes are done, get the model diff containing all the changes and convert them to view and then render to DOM.
		this.listenTo( this.model, 'changesDone', () => {
			// Convert changes stored in `modelDiffer`.
			this.modelToView.convertChanges( modelDiffer );

			// Reset model diff object. When next operation is applied, new diff will be created.
			modelDiffer.reset();

			// After the view is ready, convert selection from model to view.
			this.modelToView.convertSelection( this.model.document.selection );

			// When everything is converted to the view, render it to DOM.
			this.view.render();
		}, { priority: 'low' } );

		// Convert selection from view to model.
		this.listenTo( this.view, 'selectionChange', convertSelectionChange( this.model, this.mapper ) );

		// Attach default model converters.
		this.modelToView.on( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.modelToView.on( 'remove', remove(), { priority: 'low' } );

		// Attach default model selection converters.
		this.modelToView.on( 'selection', clearAttributes(), { priority: 'low' } );
		this.modelToView.on( 'selection', clearFakeSelection(), { priority: 'low' } );
		this.modelToView.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		this.modelToView.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );

		// Binds {@link module:engine/view/document~Document#roots view roots collection} to
		// {@link module:engine/model/document~Document#roots model roots collection} so creating
		// model root automatically creates corresponding view root.
		this.view.roots.bindTo( this.model.document.roots ).using( root => {
			// $graveyard is a special root that has no reflection in the view.
			if ( root.rootName == '$graveyard' ) {
				return null;
			}

			const viewRoot = new RootEditableElement( root.name );

			viewRoot.rootName = root.rootName;
			viewRoot.document = this.view;
			this.mapper.bindElements( root, viewRoot );

			return viewRoot;
		} );
	}

	/**
	 * Removes all event listeners attached to the `EditingController`. Destroys all objects created
	 * by `EditingController` that need to be destroyed.
	 */
	destroy() {
		this.view.destroy();
		this.stopListening();
	}
}

mix( EditingController, ObservableMixin );
