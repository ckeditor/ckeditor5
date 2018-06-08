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
import { clearAttributes, convertCollapsedSelection, convertRangeSelection } from '../conversion/downcast-selection-converters';

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

		// Add selection post fixer.
		doc.registerPostFixer( writer => selectionPostFixer( writer, model ) );

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

/**
 * The selection post fixer which check if nodes with `isLimit` property in schema are properly selected.
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {module:engine/model/model~Model} model
 */
function selectionPostFixer( writer, model ) {
	const selection = model.document.selection;
	const schema = model.schema;

	const ranges = [];

	let wasFixed = false;

	for ( const modelRange of selection.getRanges() ) {
		// Go through all ranges in selection and try fixing each of them.
		// Those ranges might overlap but will be corrected later.
		const correctedRange = tryFixRangeWithIsLimitBlocks( modelRange, schema );

		if ( correctedRange ) {
			ranges.push( correctedRange );
			wasFixed = true;
		} else {
			ranges.push( modelRange );
		}
	}

	// If any of ranges were corrected update the selection.
	if ( wasFixed ) {
		// The above algorithm might create ranges that intersects each other when selection contains more then one range.
		// This is case happens mostly on Firefox which creates multiple ranges for selected table.
		const safeRange = combineRangesOnLimitNodes( ranges );

		writer.setSelection( safeRange, { backward: selection.isBackward } );
	}
}

// Tries to correct a range if it contains blocks defined as `isLimit` in schema.
//
// @param {module:engine/model/range~Range} range
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixRangeWithIsLimitBlocks( range, schema ) {
	if ( range.isCollapsed ) {
		return tryFixCollapsedRange( range, schema );
	}

	return tryFixExpandedRange( range, schema );
}

// Tries to fix collapsed ranges - ie. when collapsed selection is in limit node that contains other limit nodes.
//
// @param {module:engine/model/range~Range} range Collapsed range to fix.
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixCollapsedRange( range, schema ) {
	const originalPosition = range.start;

	const nearestSelectionRange = schema.getNearestSelectionRange( originalPosition );

	// This might be null ie when editor data is empty.
	// In such cases there is no need to fix the selection range.
	if ( !nearestSelectionRange ) {
		return null;
	}

	const fixedPosition = nearestSelectionRange.start;

	// Fixed position is the same as original - no need to return corrected range.
	if ( originalPosition.isEqual( fixedPosition ) ) {
		return null;
	}

	// Check single node selection (happens in tables).
	if ( fixedPosition.nodeAfter && schema.isLimit( fixedPosition.nodeAfter ) ) {
		return new Range( fixedPosition, Position.createAfter( fixedPosition.nodeAfter ) );
	}

	return new Range( fixedPosition );
}

// Tries to fix a expanded range that overlaps limit nodes.
//
// @param {module:engine/model/range~Range} range Expanded range to fix.
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixExpandedRange( range, schema ) {
	// No need to check flat ranges as they will not cross node boundary.
	if ( range.isFlat ) {
		return null;
	}

	const start = range.start;
	const end = range.end;

	const updatedStart = expandSelectionOnIsLimitNode( start, schema, 'start' );
	const updatedEnd = expandSelectionOnIsLimitNode( end, schema, 'end' );

	if ( !start.isEqual( updatedStart ) || !end.isEqual( updatedEnd ) ) {
		return new Range( updatedStart, updatedEnd );
	}

	return null;
}

// Expands selection so it contains whole limit node.
//
// @param {module:engine/model/position~Position} position
// @param {module:engine/model/schema~Schema} schema
// @param {String} expandToDirection Direction of expansion - either 'start' or 'end' of the range.
// @returns {module:engine/model/position~Position}
function expandSelectionOnIsLimitNode( position, schema, expandToDirection ) {
	let node = position.parent;
	let parent = node;

	// Find outer most isLimit block as such blocks might be nested (ie. in tables).
	while ( schema.isLimit( parent ) && parent.parent ) {
		node = parent;
		parent = parent.parent;
	}

	if ( node === parent ) {
		// If there is not is limit block the return original position.
		return position;
	}

	// Depending on direction of expanding selection return position before or after found node.
	return expandToDirection === 'start' ? Position.createBefore( node ) : Position.createAfter( node );
}

// Returns minimal set of continuous ranges.
//
// @param {Array.<module:engine/model/range~Range>} ranges
// @returns {Array.<module:engine/model/range~Range>}
function combineRangesOnLimitNodes( ranges ) {
	const combinedRanges = [];

	let previousRange;

	for ( let i = 0; i < ranges.length; i++ ) {
		const range = ranges[ i ];

		if ( !previousRange ) {
			previousRange = range;
			combinedRanges.push( previousRange );
			continue;
		}

		// Do not push same ranges (ie might be created in a table)
		if ( range.isEqual( previousRange ) ) {
			continue;
		}

		if ( range.isIntersecting( previousRange ) ) {
			const newStart = previousRange.start.isBefore( range.start ) ? previousRange.start : range.start;
			const newEnd = range.end.isAfter( previousRange.end ) ? range.end : previousRange.end;
			const newRange = new Range( newStart, newEnd );

			combinedRanges.splice( combinedRanges.indexOf( previousRange ), 1, newRange );

			previousRange = newRange;

			continue;
		}

		previousRange = range;
		combinedRanges.push( range );
	}

	return combinedRanges;
}
