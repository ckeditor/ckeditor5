/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewDocument from '../view/document.js';
import Mapper from '../conversion/mapper.js';
import ModelConversionDispatcher from '../conversion/modelconversiondispatcher.js';
import { insertText, remove, move, rename } from '../conversion/model-to-view-converters.js';
import { convertSelectionChange } from '../conversion/view-selection-to-model-converters.js';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	clearAttributes,
	clearFakeSelection
} from '../conversion/model-selection-to-view-converters.js';

import EmitterMixin from '../../utils/emittermixin.js';

/**
 * Controller for the editing pipeline. The editing pipeline controls {@link engine.controller.EditingController#model model} rendering,
 * including selection handling. It also creates {@link engine.controller.EditingController#view view document} which build a
 * browser-independent virtualization over the DOM elements. Editing controller also attach default converters.
 *
 * @memberOf engine.controller
 */
export default class EditingController {
	/**
	 * Creates editing controller instance.
	 *
	 * @param {engine.model.Document} model Document model.
	 */
	constructor( model ) {
		/**
		 * Document model.
		 *
		 * @readonly
		 * @member {engine.model.document} engine.controller.EditingController#model
		 */
		this.model = model;

		/**
		 * View document.
		 *
		 * @readonly
		 * @member {engine.view.document} engine.controller.EditingController#view
		 */
		this.view = new ViewDocument();

		/**
		 * Mapper which describes model-view binding.
		 *
		 * @readonly
		 * @member {engine.conversion.Mapper} engine.controller.EditingController#mapper
		 */
		this.mapper = new Mapper();

		/**
		 * Model to view conversion dispatcher, which converts changes from the model to
		 * {@link engine.controller.EditingController#view editing view}.
		 *
		 * To attach model to view converter to the editing pipeline you need to add lister to this property:
		 *
		 *		editing.modelToView( 'insert:$element', customInsertConverter );
		 *
		 * Or use {@link engine.conversion.ModelConverterBuilder}:
		 *
		 *		buildModelConverter().for( editing.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );
		 *
		 * @readonly
		 * @member {engine.conversion.ModelConversionDispatcher} engine.controller.EditingController#modelToView
		 */
		this.modelToView = new ModelConversionDispatcher( {
			mapper: this.mapper,
			viewSelection: this.view.selection
		} );

		/**
		 * Property keeping all listenters attached by controller on other objects, so it can
		 * stop listening on {@link engine.controller.EditingController#destroy}.
		 *
		 * @private
		 * @member {utils.EmitterMixin} engine.controller.EditingController#_listenter
		 */
		this._listenter = Object.create( EmitterMixin );

		// Convert changes in model to view.
		this._listenter.listenTo( this.model, 'change', ( evt, type, changes ) => {
			this.modelToView.convertChange( type, changes );
		}, { priority: 'low' } );

		// Convert model selection to view.
		this._listenter.listenTo( this.model, 'changesDone', () => {
			this.modelToView.convertSelection( model.selection );
			this.view.render();
		}, { priority: 'low' } );

		// Convert view selection to model.
		this._listenter.listenTo( this.view, 'selectionChange', convertSelectionChange( model, this.mapper ) );

		// Attach default content converters.
		this.modelToView.on( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.modelToView.on( 'remove', remove(), { priority: 'low' } );
		this.modelToView.on( 'move', move(), { priority: 'low' } );
		this.modelToView.on( 'rename', rename(), { priority: 'low' } );

		// Attach default selection converters.
		this.modelToView.on( 'selection', clearAttributes(), { priority: 'low' } );
		this.modelToView.on( 'selection', clearFakeSelection(), { priority: 'low' } );
		this.modelToView.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		this.modelToView.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );
	}

	/**
	 * {@link engine.view.Document#createRoot Creates} a view root and {@link engine.conversion.Mapper#bindElements binds}
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
	 * @returns {engine.view.ContainerElement} View root element.
	 */
	createRoot( domRoot, name = 'main' ) {
		const viewRoot = this.view.createRoot( domRoot, name );
		const modelRoot = this.model.getRoot( name );

		this.mapper.bindElements( modelRoot, viewRoot );

		return viewRoot;
	}

	/**
	 * Removes all event listeners attached by the EditingController.
	 */
	destroy() {
		this.view.destroy();
		this._listenter.stopListening();
	}
}
