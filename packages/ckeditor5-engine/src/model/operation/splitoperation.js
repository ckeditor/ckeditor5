/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/splitoperation
 */

import Operation from './operation';
import MergeOperation from './mergeoperation';
import Position from '../position';
import Range from '../range';
import { _insert, _move } from './utils';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to split {@link module:engine/model/element~Element an element} at given
 * {@link module:engine/model/operation/splitoperation~SplitOperation#splitPosition split position} into two elements,
 * both containing a part of the element's original content.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class SplitOperation extends Operation {
	/**
	 * Creates a split operation.
	 *
	 * @param {module:engine/model/position~Position} splitPosition Position at which an element should be split.
	 * @param {Number} howMany Total offset size of elements that are in the split element after `position`.
	 * @param {module:engine/model/position~Position|null} graveyardPosition Position in the graveyard root before the element which
	 * should be used as a parent of the nodes after `position`. If it is not set, a copy of the the `position` parent will be used.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( splitPosition, howMany, graveyardPosition, baseVersion ) {
		super( baseVersion );

		/**
		 * Position at which an element should be split.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/splitoperation~SplitOperation#splitPosition
		 */
		this.splitPosition = splitPosition.clone();
		// Keep position sticking to the next node. This way any new content added at the place where the element is split
		// will be left in the original element.
		this.splitPosition.stickiness = 'toNext';

		/**
		 * Total offset size of elements that are in the split element after `position`.
		 *
		 * @member {Number} module:engine/model/operation/splitoperation~SplitOperation#howMany
		 */
		this.howMany = howMany;

		/**
		 * Position at which the clone of split element (or element from graveyard) will be inserted.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/splitoperation~SplitOperation#insertionPosition
		 */
		this.insertionPosition = SplitOperation.getInsertionPosition( splitPosition );
		this.insertionPosition.stickiness = 'toNone';

		/**
		 * Position in the graveyard root before the element which should be used as a parent of the nodes after `position`.
		 * If it is not set, a copy of the the `position` parent will be used.
		 *
		 * The default behavior is to clone the split element. Element from graveyard is used during undo.
		 *
		 * @member {module:engine/model/position~Position|null} #graveyardPosition
		 */
		this.graveyardPosition = graveyardPosition ? graveyardPosition.clone() : null;

		if ( this.graveyardPosition ) {
			this.graveyardPosition.stickiness = 'toNext';
		}
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'split';
	}

	/**
	 * Position inside the new clone of a split element.
	 *
	 * This is a position where nodes that are after the split position will be moved to.
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position}
	 */
	get moveTargetPosition() {
		const path = this.insertionPosition.path.slice();
		path.push( 0 );

		return new Position( this.insertionPosition.root, path );
	}

	/**
	 * Artificial range that contains all the nodes from the split element that will be moved to the new element.
	 * The range starts at {@link ~#splitPosition} and ends in the same parent, at `POSITIVE_INFINITY` offset.
	 *
	 * @readonly
	 * @type {module:engine/model/range~Range}
	 */
	get movedRange() {
		const end = this.splitPosition.getShiftedBy( Number.POSITIVE_INFINITY );

		return new Range( this.splitPosition, end );
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/splitoperation~SplitOperation} Clone of this operation.
	 */
	clone() {
		const split = new this.constructor( this.splitPosition, this.howMany, this.graveyardPosition, this.baseVersion );
		split.insertionPosition = this.insertionPosition;

		return split;
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/mergeoperation~MergeOperation}
	 */
	getReversed() {
		const graveyard = this.splitPosition.root.document.graveyard;
		const graveyardPosition = new Position( graveyard, [ 0 ] );

		return new MergeOperation( this.moveTargetPosition, this.howMany, this.splitPosition, graveyardPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		const element = this.splitPosition.parent;
		const offset = this.splitPosition.offset;

		// Validate whether split operation has correct parameters.
		if ( !element || element.maxOffset < offset ) {
			/**
			 * Split position is invalid.
			 *
			 * @error split-operation-position-invalid
			 */
			throw new CKEditorError( 'split-operation-position-invalid: Split position is invalid.', this );
		} else if ( !element.parent ) {
			/**
			 * Cannot split root element.
			 *
			 * @error split-operation-split-in-root
			 */
			throw new CKEditorError( 'split-operation-split-in-root: Cannot split root element.', this );
		} else if ( this.howMany != element.maxOffset - this.splitPosition.offset ) {
			/**
			 * Split operation specifies wrong number of nodes to move.
			 *
			 * @error split-operation-how-many-invalid
			 */
			throw new CKEditorError( 'split-operation-how-many-invalid: Split operation specifies wrong number of nodes to move.', this );
		} else if ( this.graveyardPosition && !this.graveyardPosition.nodeAfter ) {
			/**
			 * Graveyard position invalid.
			 *
			 * @error split-operation-graveyard-position-invalid
			 */
			throw new CKEditorError( 'split-operation-graveyard-position-invalid: Graveyard position invalid.', this );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		const splitElement = this.splitPosition.parent;

		if ( this.graveyardPosition ) {
			_move( Range._createFromPositionAndShift( this.graveyardPosition, 1 ), this.insertionPosition );
		} else {
			const newElement = splitElement._clone();

			_insert( this.insertionPosition, newElement );
		}

		const sourceRange = new Range(
			Position._createAt( splitElement, this.splitPosition.offset ),
			Position._createAt( splitElement, splitElement.maxOffset )
		);

		_move( sourceRange, this.moveTargetPosition );
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		json.splitPosition = this.splitPosition.toJSON();
		json.insertionPosition = this.insertionPosition.toJSON();

		if ( this.graveyardPosition ) {
			json.graveyardPosition = this.graveyardPosition.toJSON();
		}

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'SplitOperation';
	}

	/**
	 * Helper function that returns a default insertion position basing on given `splitPosition`. The default insertion
	 * position is after the split element.
	 *
	 * @param {module:engine/model/position~Position} splitPosition
	 * @returns {module:engine/model/position~Position}
	 */
	static getInsertionPosition( splitPosition ) {
		const path = splitPosition.path.slice( 0, -1 );
		path[ path.length - 1 ]++;

		return new Position( splitPosition.root, path );
	}

	/**
	 * Creates `SplitOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/splitoperation~SplitOperation}
	 */
	static fromJSON( json, document ) {
		const splitPosition = Position.fromJSON( json.splitPosition, document );
		const insertionPosition = Position.fromJSON( json.insertionPosition, document );
		const graveyardPosition = json.graveyardPosition ? Position.fromJSON( json.graveyardPosition, document ) : null;

		const split = new this( splitPosition, json.howMany, graveyardPosition, json.baseVersion );
		split.insertionPosition = insertionPosition;

		return split;
	}
}
