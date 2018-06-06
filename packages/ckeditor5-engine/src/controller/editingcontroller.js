/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/editingcontroller
 */

import RootEditableElement from '../view/rooteditableelement';
import View from '../view/view';
import Mapper from '../conversion/mapper';
import DowncastDispatcher from '../conversion/downcastdispatcher';
import { insertText, remove } from '../conversion/downcast-converters';
import { convertSelectionChange } from '../conversion/upcast-selection-converters';
import {
	convertRangeSelection,
	convertCollapsedSelection,
	clearAttributes
} from '../conversion/downcast-selection-converters';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

import Range from '../model/range';
import Position from '../model/position';

/**
 * Controller for the editing pipeline. The editing pipeline controls {@link ~EditingController#model model} rendering,
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
	 */
	constructor( model ) {
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
		this.view = new View();

		/**
		 * Mapper which describes the model-view binding.
		 *
		 * @readonly
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Downcast dispatcher that converts changes from the model to {@link #view the editing view}.
		 *
		 * @readonly
		 * @member {module:engine/conversion/downcastdispatcher~DowncastDispatcher} #downcastDispatcher
		 */
		this.downcastDispatcher = new DowncastDispatcher( {
			mapper: this.mapper
		} );

		const doc = this.model.document;
		const selection = doc.selection;
		const markers = this.model.markers;

		// Whenever model document is changed, convert those changes to the view (using model.Document#differ).
		// Do it on 'low' priority, so changes are converted after other listeners did their job.
		// Also convert model selection.
		this.listenTo( doc, 'change', () => {
			this.view.change( writer => {
				this.downcastDispatcher.convertChanges( doc.differ, writer );
				this.downcastDispatcher.convertSelection( selection, markers, writer );
			} );
		}, { priority: 'low' } );

		// Convert selection from the view to the model when it changes in the view.
		this.listenTo( this.view.document, 'selectionChange', convertSelectionChange( this.model, this.mapper ) );

		// Attach default model converters.
		this.downcastDispatcher.on( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.downcastDispatcher.on( 'remove', remove(), { priority: 'low' } );

		// Attach default model selection converters.
		this.downcastDispatcher.on( 'selection', clearAttributes(), { priority: 'low' } );
		this.downcastDispatcher.on( 'selection', convertRangeSelection(), { priority: 'low' } );
		this.downcastDispatcher.on( 'selection', convertCollapsedSelection(), { priority: 'low' } );

		// Add selection postfixer.
		doc.registerPostFixer( writer => {
			const updatedRanges = [];

			let needsUpdate = false;

			for ( const modelRange of selection.getRanges() ) {
				const correctedRange = correctRange( modelRange, model.schema );

				if ( correctedRange ) {
					updatedRanges.push( correctedRange );
					needsUpdate = true;
				} else {
					updatedRanges.push( modelRange );
				}
			}

			if ( needsUpdate ) {
				writer.setSelection( updatedRanges, { backward: selection.isBackward } );
			}
		} );

		// Binds {@link module:engine/view/document~Document#roots view roots collection} to
		// {@link module:engine/model/document~Document#roots model roots collection} so creating
		// model root automatically creates corresponding view root.
		this.view.document.roots.bindTo( this.model.document.roots ).using( root => {
			// $graveyard is a special root that has no reflection in the view.
			if ( root.rootName == '$graveyard' ) {
				return null;
			}

			const viewRoot = new RootEditableElement( root.name );

			viewRoot.rootName = root.rootName;
			viewRoot._document = this.view.document;
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

function correctRange( range, schema ) {
	if ( range.isCollapsed ) {
		// check only if position is allowed:
		const originalPosition = range.start;

		const nearestSelectionRange = schema.getNearestSelectionRange( originalPosition );

		// This get empty if editor data is empty (some tests)
		if ( !nearestSelectionRange ) {
			return null;
		}

		const fixedPosition = nearestSelectionRange.start;

		if ( !originalPosition.isEqual( fixedPosition ) ) {
			return new Range( fixedPosition );
		}

		return null;
	}

	if ( range.isFlat || range.isCollapsed ) {
		return null;
	}

	const start = range.start;
	const end = range.end;

	const updatedStart = ensurePositionInIsLimitBlock( start, schema, 'start' );
	const updatedEnd = ensurePositionInIsLimitBlock( end, schema, 'end' );

	if ( !start.isEqual( updatedStart ) || !end.isEqual( updatedEnd ) ) {
		return new Range( updatedStart, updatedEnd );
	}

	return null;
}

function ensurePositionInIsLimitBlock( position, schema, where ) {
	let parent = position.parent;
	let node = parent;

	while ( schema.isLimit( parent ) && parent.parent ) {
		node = parent;
		parent = parent.parent;
	}

	if ( node === parent ) {
		return position;
	}

	return where === 'start' ? Position.createBefore( node ) : Position.createAfter( node );
}
