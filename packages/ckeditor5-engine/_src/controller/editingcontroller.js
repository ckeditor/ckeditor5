/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/controller/editingcontroller
 */

import RootEditableElement from '../view/rooteditableelement';
import View from '../view/view';
import Mapper from '../conversion/mapper';
import DowncastDispatcher from '../conversion/downcastdispatcher';
import {
	clearAttributes,
	convertCollapsedSelection,
	convertRangeSelection,
	insertAttributesAndChildren,
	insertText,
	remove
} from '../conversion/downcasthelpers';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { convertSelectionChange } from '../conversion/upcasthelpers';

// @if CK_DEBUG_ENGINE // const { dumpTrees, initDocumentDumping } = require( '../dev-utils/utils' );

/**
 * A controller for the editing pipeline. The editing pipeline controls the {@link ~EditingController#model model} rendering,
 * including selection handling. It also creates the {@link ~EditingController#view view} which builds a
 * browser-independent virtualization over the DOM elements. The editing controller also attaches default converters.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class EditingController {
	/**
	 * Creates an editing controller instance.
	 *
	 * @param {module:engine/model/model~Model} model Editing model.
	 * @param {module:engine/view/stylesmap~StylesProcessor} stylesProcessor The styles processor instance.
	 */
	constructor( model, stylesProcessor ) {
		/**
		 * Editor model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * Editing view controller.
		 *
		 * @readonly
		 * @member {module:engine/view/view~View}
		 */
		this.view = new View( stylesProcessor );

		/**
		 * A mapper that describes the model-view binding.
		 *
		 * @readonly
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Downcast dispatcher that converts changes from the model to the {@link #view editing view}.
		 *
		 * @readonly
		 * @member {module:engine/conversion/downcastdispatcher~DowncastDispatcher} #downcastDispatcher
		 */
		this.downcastDispatcher = new DowncastDispatcher( {
			mapper: this.mapper,
			schema: model.schema
		} );

		const doc = this.model.document;
		const selection = doc.selection;
		const markers = this.model.markers;

		// When plugins listen on model changes (on selection change, post fixers, etc.) and change the view as a result of
		// the model's change, they might trigger view rendering before the conversion is completed (e.g. before the selection
		// is converted). We disable rendering for the length of the outermost model change() block to prevent that.
		//
		// See https://github.com/ckeditor/ckeditor5-engine/issues/1528
		this.listenTo( this.model, '_beforeChanges', () => {
			this.view._disableRendering( true );
		}, { priority: 'highest' } );

		this.listenTo( this.model, '_afterChanges', () => {
			this.view._disableRendering( false );
		}, { priority: 'lowest' } );

		// Whenever model document is changed, convert those changes to the view (using model.Document#differ).
		// Do it on 'low' priority, so changes are converted after other listeners did their job.
		// Also convert model selection.
		this.listenTo( doc, 'change', () => {
			this.view.change( writer => {
				this.downcastDispatcher.convertChanges( doc.differ, markers, writer );
				this.downcastDispatcher.convertSelection( selection, markers, writer );
			} );
		}, { priority: 'low' } );

		// Convert selection from the view to the model when it changes in the view.
		this.listenTo( this.view.document, 'selectionChange', convertSelectionChange( this.model, this.mapper ) );

		// Attach default model converters.
		this.downcastDispatcher.on( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.downcastDispatcher.on( 'insert', insertAttributesAndChildren(), { priority: 'lowest' } );
		this.downcastDispatcher.on( 'remove', remove(), { priority: 'low' } );

		// Attach default model selection converters.
		this.downcastDispatcher.on( 'selection', clearAttributes(), { priority: 'high' } );
		this.downcastDispatcher.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		this.downcastDispatcher.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );

		// Binds {@link module:engine/view/document~Document#roots view roots collection} to
		// {@link module:engine/model/document~Document#roots model roots collection} so creating
		// model root automatically creates corresponding view root.
		this.view.document.roots.bindTo( this.model.document.roots ).using( root => {
			// $graveyard is a special root that has no reflection in the view.
			if ( root.rootName == '$graveyard' ) {
				return null;
			}

			const viewRoot = new RootEditableElement( this.view.document, root.name );

			viewRoot.rootName = root.rootName;
			this.mapper.bindElements( root, viewRoot );

			return viewRoot;
		} );

		// @if CK_DEBUG_ENGINE // initDocumentDumping( this.model.document );
		// @if CK_DEBUG_ENGINE // initDocumentDumping( this.view.document );

		// @if CK_DEBUG_ENGINE // dumpTrees( this.model.document, this.model.document.version );
		// @if CK_DEBUG_ENGINE // dumpTrees( this.view.document, this.model.document.version );

		// @if CK_DEBUG_ENGINE // this.model.document.on( 'change', () => {
		// @if CK_DEBUG_ENGINE //	dumpTrees( this.view.document, this.model.document.version );
		// @if CK_DEBUG_ENGINE // }, { priority: 'lowest' } );
	}

	/**
	 * Removes all event listeners attached to the `EditingController`. Destroys all objects created
	 * by `EditingController` that need to be destroyed.
	 */
	destroy() {
		this.view.destroy();
		this.stopListening();
	}

	/**
	 * Calling this method will refresh the marker by triggering the downcast conversion for it.
	 *
	 * Reconverting the marker is useful when you want to change its {@link module:engine/view/element~Element view element}
	 * without changing any marker data. For instance:
	 *
	 *		let isCommentActive = false;
	 *
	 *		model.conversion.markerToHighlight( {
	 *			model: 'comment',
	 *			view: data => {
	 *				const classes = [ 'comment-marker' ];
	 *
	 *				if ( isCommentActive ) {
	 *					classes.push( 'comment-marker--active' );
	 *				}
	 *
	 *				return { classes };
	 *			}
	 *		} );
	 *
	 *		// ...
	 *
	 *		// Change the property that indicates if marker is displayed as active or not.
	 *		isCommentActive = true;
	 *
	 *		// Reconverting will downcast and synchronize the marker with the new isCommentActive state value.
	 *		editor.editing.reconvertMarker( 'comment' );
	 *
	 * **Note**: If you want to reconvert a model item, use {@link #reconvertItem} instead.
	 *
	 * @param {String|module:engine/model/markercollection~Marker} markerOrName Name of a marker to update, or a marker instance.
	 */
	reconvertMarker( markerOrName ) {
		const markerName = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;
		const currentMarker = this.model.markers.get( markerName );

		if ( !currentMarker ) {
			/**
			 * The marker with the provided name does not exist and cannot be reconverted.
			 *
			 * @error editingcontroller-reconvertmarker-marker-not-exist
			 * @param {String} markerName The name of the reconverted marker.
			 */
			throw new CKEditorError( 'editingcontroller-reconvertmarker-marker-not-exist', this, { markerName } );
		}

		this.model.change( () => {
			this.model.markers._refresh( currentMarker );
		} );
	}

	/**
	 * Calling this method will downcast a model item on demand (by requesting a refresh in the {@link module:engine/model/differ~Differ}).
	 *
	 * You can use it if you want the view representation of a specific item updated as a response to external modifications. For instance,
	 * when the view structure depends not only on the associated model data but also on some external state.
	 *
	 * **Note**: If you want to reconvert a model marker, use {@link #reconvertMarker} instead.
	 *
	 * @param {module:engine/model/item~Item} item Item to refresh.
	 */
	reconvertItem( item ) {
		this.model.change( () => {
			this.model.document.differ._refreshItem( item );
		} );
	}
}

mix( EditingController, ObservableMixin );
