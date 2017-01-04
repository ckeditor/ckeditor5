/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/editingcontroller
 */

import ViewDocument from '../view/document';
import Mapper from '../conversion/mapper';
import ModelConversionDispatcher from '../conversion/modelconversiondispatcher';
import {
	insertText,
	remove,
	move,
	rename,
	insertIntoMarker,
	moveInOutOfMarker
} from '../conversion/model-to-view-converters';
import { convertSelectionChange } from '../conversion/view-selection-to-model-converters';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	clearAttributes,
	clearFakeSelection
} from '../conversion/model-selection-to-view-converters';

import EmitterMixin from 'ckeditor5-utils/src/emittermixin';

/**
 * Controller for the editing pipeline. The editing pipeline controls {@link ~EditingController#model model} rendering,
 * including selection handling. It also creates {@link ~EditingController#view view document} which build a
 * browser-independent virtualization over the DOM elements. Editing controller also attach default converters.
 */
export default class EditingController {
	/**
	 * Creates editing controller instance.
	 *
	 * @param {module:engine/model/document~Document} model Document model.
	 */
	constructor( model ) {
		/**
		 * Document model.
		 *
		 * @readonly
		 * @member {module:engine/model/document~Document}
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
		 * Model to view conversion dispatcher, which converts changes from the model to
		 * {@link #view editing view}.
		 *
		 * To attach model to view converter to the editing pipeline you need to add lister to this property:
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
		this.modelToView = new ModelConversionDispatcher( {
			mapper: this.mapper,
			viewSelection: this.view.selection
		} );

		/**
		 * Property keeping all listenters attached by controller on other objects, so it can
		 * stop listening on {@link #destroy}.
		 *
		 * @private
		 * @member {utils.EmitterMixin} #_listenter
		 */
		this._listener = Object.create( EmitterMixin );

		// Convert changes in model to view.
		this._listener.listenTo( this.model, 'change', ( evt, type, changes ) => {
			this.modelToView.convertChange( type, changes );
		}, { priority: 'low' } );

		// Convert model selection to view.
		this._listener.listenTo( this.model, 'changesDone', () => {
			this.modelToView.convertSelection( model.selection );
			this.view.render();
		}, { priority: 'low' } );

		// Convert model markers changes.
		this._listener.listenTo( this.model.markers, 'add', ( evt, name, range ) => {
			this.modelToView.convertMarker( 'addMarker', name, range );
		} );

		this._listener.listenTo( this.model.markers, 'remove', ( evt, name, range ) => {
			this.modelToView.convertMarker( 'removeMarker', name, range );
		} );

		// Convert view selection to model.
		this._listener.listenTo( this.view, 'selectionChange', convertSelectionChange( model, this.mapper ) );

		// Attach default content converters.
		this.modelToView.on( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.modelToView.on( 'remove', remove(), { priority: 'low' } );
		this.modelToView.on( 'move', move(), { priority: 'low' } );
		this.modelToView.on( 'rename', rename(), { priority: 'low' } );

		// Attach default markers converters.
		this.modelToView.on( 'insert', insertIntoMarker( this.model.markers ), { priority: 'lowest' } );
		this.modelToView.on( 'move', moveInOutOfMarker( this.model.markers ), { priority: 'lowest' } );

		// Attach default selection converters.
		this.modelToView.on( 'selection', clearAttributes(), { priority: 'low' } );
		this.modelToView.on( 'selection', clearFakeSelection(), { priority: 'low' } );
		this.modelToView.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		this.modelToView.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );
	}

	/**
	 * {@link module:engine/view/document~Document#createRoot Creates} a view root
	 * and {@link module:engine/conversion/mapper~Mapper#bindElements binds}
	 * the model root with view root and and view root with DOM element:
	 *
	 *		editing.createRoot( document.querySelector( div#editor ) );
	 *
	 * If the DOM element is not available at the time you want to create a view root, for instance it is iframe body
	 * element, it is possible to create view element and bind the DOM element later:
	 *
	 *		editing.createRoot( 'body' );
	 *		editing.view.attachDomRoot( iframe.contentDocument.body );
	 *
	 * @param {Element|String} domRoot DOM root element or the name of view root element if the DOM element will be
	 * attached later.
	 * @param {String} [name='main'] Root name.
	 * @returns {module:engine/view/containerelement~ContainerElement} View root element.
	 */
	createRoot( domRoot, name = 'main' ) {
		const viewRoot = this.view.createRoot( domRoot, name );
		const modelRoot = this.model.getRoot( name );

		this.mapper.bindElements( modelRoot, viewRoot );

		return viewRoot;
	}

	/**
	 * Removes all event listeners attached to the `EditingController`. Destroys all objects created
	 * by `EditingController` that need to be destroyed.
	 */
	destroy() {
		this.view.destroy();
		this._listener.stopListening();
	}
}
