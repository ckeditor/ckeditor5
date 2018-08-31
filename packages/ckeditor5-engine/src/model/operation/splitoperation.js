/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
 * {@link module:engine/model/operation/splitoperation~SplitOperation#position position} into two elements,
 * both containing a part of the element's original content.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class SplitOperation extends Operation {
	/**
	 * Creates a split operation.
	 *
	 * @param {module:engine/model/position~Position} position Position at which an element should be split.
	 * @param {Number} howMany Total offset size of elements that are in the split element after `position`.
	 * @param {module:engine/model/position~Position|null} graveyardPosition Position in the graveyard root before the element which
	 * should be used as a parent of the nodes after `position`. If it is not set, a copy of the the `position` parent will be used.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( position, howMany, graveyardPosition, baseVersion ) {
		super( baseVersion );

		/**
		 * Position at which an element should be split.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/splitoperation~SplitOperation#position
		 */
		this.position = Position.createFromPosition( position );
		// Keep position sticking to the next node. This way any new content added at the place where the element is split
		// will be left in the original element.
		this.position.stickiness = 'toNext';

		/**
		 * Total offset size of elements that are in the split element after `position`.
		 *
		 * @member {Number} module:engine/model/operation/splitoperation~SplitOperation#howMany
		 */
		this.howMany = howMany;

		/**
		 * Position in the graveyard root before the element which should be used as a parent of the nodes after `position`.
		 * If it is not set, a copy of the the `position` parent will be used.
		 *
		 * The default behavior is to clone the split element. Element from graveyard is used during undo.
		 *
		 * @member {module:engine/model/position~Position|null} #graveyardPosition
		 */
		this.graveyardPosition = graveyardPosition ? Position.createFromPosition( graveyardPosition ) : null;

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
	 * Position after the split element.
	 *
	 * This is a position at which the clone of split element (or element from graveyard) will be inserted.
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position}
	 */
	get insertionPosition() {
		const path = this.position.path.slice( 0, -1 );
		path[ path.length - 1 ]++;

		return new Position( this.position.root, path );
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
		const path = this.position.path.slice( 0, -1 );
		path[ path.length - 1 ]++;
		path.push( 0 );

		return new Position( this.position.root, path );
	}

	/**
	 * Artificial range that contains all the nodes from the split element that will be moved to the new element.
	 * The range starts at {@link ~#position} and ends in the same parent, at `POSITIVE_INFINITY` offset.
	 *
	 * @readonly
	 * @type {module:engine/model/range~Range}
	 */
	get movedRange() {
		const end = this.position.getShiftedBy( Number.POSITIVE_INFINITY );

		return new Range( this.position, end );
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/splitoperation~SplitOperation} Clone of this operation.
	 */
	clone() {
		return new this.constructor( this.position, this.howMany, this.graveyardPosition, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/mergeoperation~MergeOperation}
	 */
	getReversed() {
		const graveyard = this.position.root.document.graveyard;
		const graveyardPosition = new Position( graveyard, [ 0 ] );

		return new MergeOperation( this.moveTargetPosition, this.howMany, this.position, graveyardPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		const element = this.position.parent;
		const offset = this.position.offset;

		// Validate whether split operation has correct parameters.
		if ( !element || element.maxOffset < offset ) {
			/**
			 * Split position is invalid.
			 *
			 * @error split-operation-position-invalid
			 */
			throw new CKEditorError( 'split-operation-position-invalid: Split position is invalid.' );
		} else if ( this.howMany != element.maxOffset - this.position.offset ) {
			/**
			 * Split operation specifies wrong number of nodes to move.
			 *
			 * @error split-operation-how-many-invalid
			 */
			throw new CKEditorError( 'split-operation-how-many-invalid: Split operation specifies wrong number of nodes to move.' );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		const splitElement = this.position.parent;

		if ( this.graveyardPosition ) {
			_move( Range.createFromPositionAndShift( this.graveyardPosition, 1 ), this.insertionPosition );
		} else {
			const newElement = splitElement._clone();

			_insert( this.insertionPosition, newElement );
		}

		const sourceRange = Range.createFromParentsAndOffsets( splitElement, this.position.offset, splitElement, splitElement.maxOffset );

		_move( sourceRange, this.moveTargetPosition );
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		json.position = this.position.toJSON();

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
	 * Creates `SplitOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/splitoperation~SplitOperation}
	 */
	static fromJSON( json, document ) {
		const position = Position.fromJSON( json.position, document );
		const graveyardPosition = json.graveyardPosition ? Position.fromJSON( json.graveyardPosition, document ) : null;

		return new this( position, json.howMany, graveyardPosition, json.baseVersion );
	}
}
