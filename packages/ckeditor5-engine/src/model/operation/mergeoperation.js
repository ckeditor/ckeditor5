/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/mergeoperation
 */

import Operation from './operation';
import SplitOperation from './splitoperation';
import Position from '../position';
import Range from '../range';
import { _move } from './utils';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to merge two {@link module:engine/model/element~Element elements}.
 *
 * The merged element is the parent of {@link ~MergeOperation#sourcePosition} and it is merged into the parent of
 * {@link ~MergeOperation#targetPosition}. All nodes from the merged element are moved to {@link ~MergeOperation#targetPosition}.
 *
 * The merged element is moved to the graveyard at {@link ~MergeOperation#graveyardPosition}.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class MergeOperation extends Operation {
	/**
	 * Creates a merge operation.
	 *
	 * @param {module:engine/model/position~Position} sourcePosition Position inside the merged element. All nodes from that
	 * element after that position will be moved to {@link ~#targetPosition}.
	 * @param {Number} howMany Summary offset size of nodes which will be moved from the merged element to the new parent.
	 * @param {module:engine/model/position~Position} targetPosition Position which the nodes from the merged elements will be moved to.
	 * @param {module:engine/model/position~Position} graveyardPosition Position in graveyard to which the merged element will be moved.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( sourcePosition, howMany, targetPosition, graveyardPosition, baseVersion ) {
		super( baseVersion );

		/**
		 * Position inside the merged element. All nodes from that element after that position will be moved to {@link ~#targetPosition}.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/mergeoperation~MergeOperation#sourcePosition
		 */
		this.sourcePosition = sourcePosition.clone();
		// This is, and should always remain, the first position in its parent.
		this.sourcePosition.stickiness = 'toPrevious';

		/**
		 * Summary offset size of nodes which will be moved from the merged element to the new parent.
		 *
		 * @member {Number} module:engine/model/operation/mergeoperation~MergeOperation#howMany
		 */
		this.howMany = howMany;

		/**
		 * Position which the nodes from the merged elements will be moved to.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/mergeoperation~MergeOperation#targetPosition
		 */
		this.targetPosition = targetPosition.clone();
		// Except of a rare scenario in `MergeOperation` x `MergeOperation` transformation,
		// this is, and should always remain, the last position in its parent.
		this.targetPosition.stickiness = 'toNext';

		/**
		 * Position in graveyard to which the merged element will be moved.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/mergeoperation~MergeOperation#graveyardPosition
		 */
		this.graveyardPosition = graveyardPosition.clone();
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'merge';
	}

	/**
	 * Position before the merged element (which will be deleted).
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position}
	 */
	get deletionPosition() {
		return new Position( this.sourcePosition.root, this.sourcePosition.path.slice( 0, -1 ) );
	}

	/**
	 * Artificial range that contains all the nodes from the merged element that will be moved to {@link ~MergeOperation#sourcePosition}.
	 * The range starts at {@link ~MergeOperation#sourcePosition} and ends in the same parent, at `POSITIVE_INFINITY` offset.
	 *
	 * @readonly
	 * @type {module:engine/model/range~Range}
	 */
	get movedRange() {
		const end = this.sourcePosition.getShiftedBy( Number.POSITIVE_INFINITY );

		return new Range( this.sourcePosition, end );
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/mergeoperation~MergeOperation} Clone of this operation.
	 */
	clone() {
		return new this.constructor( this.sourcePosition, this.howMany, this.targetPosition, this.graveyardPosition, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/splitoperation~SplitOperation}
	 */
	getReversed() {
		// Positions in this method are transformed by this merge operation because the split operation bases on
		// the context after this merge operation happened (because split operation reverses it).
		// So we need to acknowledge that the merge operation happened and those positions changed a little.
		const targetPosition = this.targetPosition._getTransformedByMergeOperation( this );

		const path = this.sourcePosition.path.slice( 0, -1 );
		const insertionPosition = new Position( this.sourcePosition.root, path )._getTransformedByMergeOperation( this );

		const split = new SplitOperation( targetPosition, this.howMany, this.graveyardPosition, this.baseVersion + 1 );
		split.insertionPosition = insertionPosition;

		return split;
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		const sourceElement = this.sourcePosition.parent;
		const targetElement = this.targetPosition.parent;

		// Validate whether merge operation has correct parameters.
		if ( !sourceElement || !sourceElement.is( 'element' ) || !sourceElement.parent ) {
			/**
			 * Merge source position is invalid.
			 *
			 * @error merge-operation-source-position-invalid
			 */
			throw new CKEditorError( 'merge-operation-source-position-invalid: Merge source position is invalid.', this );
		} else if ( !targetElement || !targetElement.is( 'element' ) || !targetElement.parent ) {
			/**
			 * Merge target position is invalid.
			 *
			 * @error merge-operation-target-position-invalid
			 */
			throw new CKEditorError( 'merge-operation-target-position-invalid: Merge target position is invalid.', this );
		} else if ( this.howMany != sourceElement.maxOffset ) {
			/**
			 * Merge operation specifies wrong number of nodes to move.
			 *
			 * @error merge-operation-how-many-invalid
			 */
			throw new CKEditorError( 'merge-operation-how-many-invalid: Merge operation specifies wrong number of nodes to move.', this );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		const mergedElement = this.sourcePosition.parent;
		const sourceRange = Range._createIn( mergedElement );

		_move( sourceRange, this.targetPosition );
		_move( Range._createOn( mergedElement ), this.graveyardPosition );
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		json.sourcePosition = json.sourcePosition.toJSON();
		json.targetPosition = json.targetPosition.toJSON();
		json.graveyardPosition = json.graveyardPosition.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'MergeOperation';
	}

	/**
	 * Creates `MergeOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/mergeoperation~MergeOperation}
	 */
	static fromJSON( json, document ) {
		const sourcePosition = Position.fromJSON( json.sourcePosition, document );
		const targetPosition = Position.fromJSON( json.targetPosition, document );
		const graveyardPosition = Position.fromJSON( json.graveyardPosition, document );

		return new this( sourcePosition, json.howMany, targetPosition, graveyardPosition, json.baseVersion );
	}
}
