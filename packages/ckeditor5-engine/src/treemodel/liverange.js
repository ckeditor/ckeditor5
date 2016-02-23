/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Range from './range.js';
import LivePosition from './liveposition.js';
import EmitterMixin from '../emittermixin.js';
import utils from '../utils.js';

/**
 * LiveRange is a Range in the Tree Model that updates itself as the tree changes. It may be used as a bookmark.
 * **Note:** Constructor creates it's own {@link core.treeModel.LivePosition} instances basing on passed values.
 * **Note:** Be very careful when dealing with LiveRange. Each LiveRange instance bind events that might
 * have to be unbound. Use {@link core.treeModel.LiveRange#detach detach} whenever you don't need LiveRange anymore.
 *
 * @memberOf core.treeModel
 */
export default class LiveRange extends Range {
	/**
	 * Creates a live range.
	 *
	 * @see core.treeModel.Range
	 */
	constructor( start, end ) {
		super( start, end );

		this.start = new LivePosition( this.start.root, this.start.path.slice(), 'STICKS_TO_NEXT' );
		this.end = new LivePosition( this.end.root, this.end.path.slice(), 'STICKS_TO_PREVIOUS' );

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by LiveRange. Use it whenever you don't need LiveRange instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	detach() {
		this.start.detach();
		this.end.detach();
		this.stopListening();
	}

	/**
	 * @see {@link core.treeModel.Range#createFromElement}
	 * @static
	 * @method core.treeModel.LiveRange.createFromElement
	 * @param {core.treeModel.Element} element
	 * @returns {core.treeModel.LiveRange}
	 */

	/**
	 * @see {@link core.treeModel.Range#createFromPositionAndShift}
	 * @static
	 * @method core.treeModel.LiveRange.createFromPositionAndShift
	 * @param {core.treeModel.Position} position
	 * @param {Number} shift
	 * @returns {core.treeModel.LiveRange}
	 */

	/**
	 * @see {@link core.treeModel.Range#createFromParentsAndOffsets}
	 * @static
	 * @method core.treeModel.LiveRange.createFromParentsAndOffsets
	 * @param {core.treeModel.Element} startElement
	 * @param {Number} startOffset
	 * @param {core.treeModel.Element} endElement
	 * @param {Number} endOffset
	 * @returns {core.treeModel.LiveRange}
	 */

	/**
	 * @see {@link core.treeModel.Range#createFromRange}
	 * @static
	 * @method core.treeModel.LiveRange.createFromRange
	 * @param {core.treeModel.Range} range
	 * @returns {core.treeModel.LiveRange}
	 */
}

/**
 * Binds this LiveRange to the {@link core.treeModel.Document} that owns this range.
 *
 * @ignore
 * @private
 * @method core.treeModel.LiveRange#bindWithDocument
 */
function bindWithDocument() {
	/*jshint validthis: true */

	this.listenTo(
		this.root.document,
		'change',
		( event, type, changes ) => {
			fixBoundaries.call( this, type, changes.range, changes.sourcePosition );
		},
		this
	);
}

/**
 * LiveRange boundaries are instances of {@link core.treeModel.LivePosition}, so it is updated thanks to them. This method
 * additionally fixes the results of updating live positions taking into account that those live positions
 * are boundaries of a range. An example case for fixing live positions is end boundary is moved before start boundary.
 *
 * @ignore
 * @private
 * @method fixBoundaries
 * @param {String} type Type of changes applied to the Tree Model.
 * @param {core.treeModel.Range} range Range containing the result of applied change.
 * @param {core.treeModel.Position} [position] Additional position parameter provided by some change events.
 */
function fixBoundaries( type, range, position ) {
	/* jshint validthis: true */

	if ( type == 'move' || type == 'remove' || type == 'reinsert' ) {
		let containsStart = range.containsPosition( this.start ) || range.start.isEqual( this.start );
		let containsEnd = range.containsPosition( this.end ) || range.end.isEqual( this.end );
		position = position.getTransformedByInsertion( range.start, range.end.offset - range.start.offset, true );

		// If the range contains both start and end, don't do anything - LivePositions that are boundaries of
		// this LiveRange are in correct places, they got correctly transformed.
		if ( containsStart && !containsEnd && !range.end.isTouching( position ) ) {
			this.start.path = position.path.slice();
			this.start.root = position.root;
		}

		if ( containsEnd && !containsStart && !range.start.isTouching( position ) ) {
			this.end.path = position.path.slice();
			this.end.root = position.root;
		}
	}
}

utils.mix( LiveRange, EmitterMixin );
