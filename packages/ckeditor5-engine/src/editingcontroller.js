/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewDocument from './view/document.js';

import MutationObserver from './view/observer/mutationobserver.js';
import SelectionObserver from './view/observer/selectionobserver.js';
import FocusObserver from './view/observer/focusobserver.js';
import KeyObserver from './view/observer/keyobserver.js';

import Mapper from './conversion/mapper.js';
import ModelConversionDispatcher from './conversion/modelconversiondispatcher.js';

import {
	convertRangeSelection,
	convertCollapsedSelection,
	clearAttributes
} from './conversion/model-selection-to-view-converters.js';

import {
	insertText,
	remove,
	move
} from './conversion/model-to-view-converters.js';

import EmitterMixin from '../utils/emittermixin.js';

export default class EditingController {
	constructor( modelDocument ) {
		this._listenters = Object.create( EmitterMixin );

		this.model = modelDocument;

		this.view = new ViewDocument();

		this.view.addObserver( MutationObserver );
		this.view.addObserver( SelectionObserver );
		this.view.addObserver( FocusObserver );
		this.view.addObserver( KeyObserver );

		// Move selection change to model
		// this._listenters.listenTo( this.view, 'selectionChange', ( evt, data ) => {
		// 	data.newSelection.getRanges();
		// } );

		this.mapper = new Mapper();

		this.modelToView = new ModelConversionDispatcher( {
			writer: this.view.writer,
			mapper: this.mapper,
			viewSelection: this.view.selection
		} );

		this._listenters.listenTo( this.model, 'change', ( evt, type, changes ) => {
			this.modelToView.convertChange( type, changes );
		} );

		this._listenters.listenTo( this.model, 'changesDone', () => {
			this.modelToView.convertSelection( this.model.selection );
			this.view.render();
		} );

		this.modelToView.on( 'insert:$text', insertText() );
		this.modelToView.on( 'remove', remove() );
		this.modelToView.on( 'move', move() );

		this.modelToView.on( 'selection', clearAttributes() );
		this.modelToView.on( 'selection', convertRangeSelection() );
		this.modelToView.on( 'selection', convertCollapsedSelection() );
	}

	createRoot( domRoot, name = 'main' ) {
		const viewRoot = this.view.createRoot( domRoot, name );
		const modelRoot = this.model.getRoot( name );

		this.mapper.bindElements( modelRoot, viewRoot );
	}

	destroy() {
		this._listenters.stopListening();
	}
}
