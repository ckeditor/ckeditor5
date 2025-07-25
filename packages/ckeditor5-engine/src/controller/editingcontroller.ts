/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/controller/editingcontroller
 */

import {
	CKEditorError,
	ObservableMixin
} from '@ckeditor/ckeditor5-utils';

import { ViewRootEditableElement } from '../view/rooteditableelement.js';
import { EditingView } from '../view/view.js';
import { Mapper } from '../conversion/mapper.js';
import {
	DowncastDispatcher,
	type DowncastInsertEvent,
	type DowncastRemoveEvent,
	type DowncastSelectionEvent,
	type DowncastCleanSelectionEvent
} from '../conversion/downcastdispatcher.js';
import {
	cleanSelection,
	convertCollapsedSelection,
	convertRangeSelection,
	insertAttributesAndChildren,
	insertText,
	remove
} from '../conversion/downcasthelpers.js';

import { convertSelectionChange } from '../conversion/upcasthelpers.js';

import type { Model, AfterChangesEvent, BeforeChangesEvent } from '../model/model.js';
import { type ModelItem } from '../model/item.js';
import { type ModelText } from '../model/text.js';
import { type ModelTextProxy } from '../model/textproxy.js';
import type { ModelDocumentChangeEvent } from '../model/document.js';
import type { Marker } from '../model/markercollection.js';
import type { StylesProcessor } from '../view/stylesmap.js';
import type { ViewDocumentObserverSelectionChangeEvent } from '../view/observer/selectionobserver.js';

// @if CK_DEBUG_ENGINE // const { dumpTrees, initDocumentDumping } = require( '../dev-utils/utils' );

/**
 * A controller for the editing pipeline. The editing pipeline controls the {@link ~EditingController#model model} rendering,
 * including selection handling. It also creates the {@link ~EditingController#view view} which builds a
 * browser-independent virtualization over the DOM elements. The editing controller also attaches default converters.
 */
export class EditingController extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * Editor model.
	 */
	public readonly model: Model;

	/**
	 * Editing view controller.
	 */
	public readonly view: EditingView;

	/**
	 * A mapper that describes the model-view binding.
	 */
	public readonly mapper: Mapper;

	/**
	 * Downcast dispatcher that converts changes from the model to the {@link #view editing view}.
	 */
	public readonly downcastDispatcher: DowncastDispatcher;

	/**
	 * Creates an editing controller instance.
	 *
	 * @param model Editing model.
	 * @param stylesProcessor The styles processor instance.
	 */
	constructor( model: Model, stylesProcessor: StylesProcessor ) {
		super();

		this.model = model;
		this.view = new EditingView( stylesProcessor );
		this.mapper = new Mapper();

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
		this.listenTo<BeforeChangesEvent>( this.model, '_beforeChanges', () => {
			this.view._disableRendering( true );
		}, { priority: 'highest' } );

		this.listenTo<AfterChangesEvent>( this.model, '_afterChanges', () => {
			this.view._disableRendering( false );
		}, { priority: 'lowest' } );

		// Whenever model document is changed, convert those changes to the view (using model.Document#differ).
		// Do it on 'low' priority, so changes are converted after other listeners did their job.
		// Also convert model selection.
		this.listenTo<ModelDocumentChangeEvent>( doc, 'change', () => {
			this.view.change( writer => {
				this.downcastDispatcher.convertChanges( doc.differ, markers, writer );
				this.downcastDispatcher.convertSelection( selection, markers, writer );
			} );
		}, { priority: 'low' } );

		// Convert selection from the view to the model when it changes in the view.
		this.listenTo<ViewDocumentObserverSelectionChangeEvent>( this.view.document, 'selectionChange',
			convertSelectionChange( this.model, this.mapper )
		);

		// Attach default model converters.
		this.downcastDispatcher.on<DowncastInsertEvent<ModelText | ModelTextProxy>>( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.downcastDispatcher.on<DowncastInsertEvent>( 'insert', insertAttributesAndChildren(), { priority: 'lowest' } );
		this.downcastDispatcher.on<DowncastRemoveEvent>( 'remove', remove(), { priority: 'low' } );

		// Attach default model selection converters.
		this.downcastDispatcher.on<DowncastCleanSelectionEvent>( 'cleanSelection', cleanSelection() );
		this.downcastDispatcher.on<DowncastSelectionEvent>( 'selection', convertRangeSelection(), { priority: 'low' } );
		this.downcastDispatcher.on<DowncastSelectionEvent>( 'selection', convertCollapsedSelection(), { priority: 'low' } );

		// Binds {@link module:engine/view/document~ViewDocument#roots view roots collection} to
		// {@link module:engine/model/document~ModelDocument#roots model roots collection} so creating
		// model root automatically creates corresponding view root.
		this.view.document.roots.bindTo( this.model.document.roots ).using( root => {
			// $graveyard is a special root that has no reflection in the view.
			if ( root.rootName == '$graveyard' ) {
				return null;
			}

			const viewRoot = new ViewRootEditableElement( this.view.document, root.name );

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
	public destroy(): void {
		this.view.destroy();
		this.stopListening();
	}

	/**
	 * Calling this method will refresh the marker by triggering the downcast conversion for it.
	 *
	 * Reconverting the marker is useful when you want to change its {@link module:engine/view/element~ViewElement view element}
	 * without changing any marker data. For instance:
	 *
	 * ```ts
	 * let isCommentActive = false;
	 *
	 * model.conversion.markerToHighlight( {
	 * 	model: 'comment',
	 * 	view: data => {
	 * 		const classes = [ 'comment-marker' ];
	 *
	 * 		if ( isCommentActive ) {
	 * 			classes.push( 'comment-marker--active' );
	 * 		}
	 *
	 * 		return { classes };
	 * 	}
	 * } );
	 *
	 * // ...
	 *
	 * // Change the property that indicates if marker is displayed as active or not.
	 * isCommentActive = true;
	 *
	 * // Reconverting will downcast and synchronize the marker with the new isCommentActive state value.
	 * editor.editing.reconvertMarker( 'comment' );
	 * ```
	 *
	 * **Note**: If you want to reconvert a model item, use {@link #reconvertItem} instead.
	 *
	 * @param markerOrName Name of a marker to update, or a marker instance.
	 */
	public reconvertMarker( markerOrName: Marker | string ): void {
		const markerName = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;
		const currentMarker = this.model.markers.get( markerName );

		if ( !currentMarker ) {
			/**
			 * The marker with the provided name does not exist and cannot be reconverted.
			 *
			 * @error editingcontroller-reconvertmarker-marker-not-exist
			 * @param {string} markerName The name of the reconverted marker.
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
	 * @param item Item to refresh.
	 */
	public reconvertItem( item: ModelItem ): void {
		this.model.change( () => {
			this.model.document.differ._refreshItem( item );
		} );
	}
}
