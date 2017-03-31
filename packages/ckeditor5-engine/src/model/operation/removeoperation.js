/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/removeoperation
 */

import MoveOperation from './moveoperation';
import Position from '../position';
import Element from '../element';
import ReinsertOperation from './reinsertoperation';

/**
 * Operation to remove a range of nodes.
 */
export default class RemoveOperation extends MoveOperation {
	/**
	 * Creates a remove operation.
	 *
	 * @param {module:engine/model/position~Position} position Position before the first {@link module:engine/model/item~Item model item} to
	 * remove.
	 * @param {Number} howMany Offset size of removed range. {@link module:engine/model/item~Item Model items} will be removed starting
	 * from `sourcePosition`, up to a `sourcePosition` with offset shifted by `howMany`.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which operation can be applied.
	 */
	constructor( position, howMany, baseVersion ) {
		const graveyard = position.root.document.graveyard;
		const graveyardPosition = new Position( graveyard, [ graveyard.maxOffset, 0 ] );

		super( position, howMany, graveyardPosition, baseVersion );

		/**
		 * Flag informing whether this operation should insert "holder" element (`true`) or should move removed nodes
		 * into existing "holder" element (`false`).
		 *
		 * The flag should be set to `true` for each "new" `RemoveOperation` that is each `RemoveOperation` originally
		 * created to remove some nodes from document (most likely created through `Batch` API).
		 *
		 * The flag should be set to `false` for each `RemoveOperation` that got created by splitting the original
		 * `RemoveOperation`, for example during operational transformation.
		 *
		 * The flag should be set to `false` whenever removing nodes that were re-inserted from graveyard. This will
		 * ensure correctness of all other operations that might change something on those nodes. This will also ensure
		 * that redundant empty graveyard holder elements are not created.
		 *
		 * @protected
		 * @type {Boolean}
		 */
		this._needsHolderElement = true;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'remove';
	}

	/**
	 * Offset of the graveyard "holder" element, in which nodes removed by this operation are stored.
	 *
	 * @protected
	 * @type {Number}
	 */
	get _holderElementOffset() {
		return this.targetPosition.path[ 0 ];
	}

	/**
	 * Sets {@link module:engine/model/operation/removeoperation~RemoveOperation#_holderElementOffset}.
	 *
	 * @protected
	 * @param {Number} offset
	 */
	set _holderElementOffset( offset ) {
		this.targetPosition.path[ 0 ] = offset;
	}

	/**
	 * @inheritDoc
	 * @returns {module:engine/model/operation/reinsertoperation~ReinsertOperation}
	 */
	getReversed() {
		return new ReinsertOperation( this.targetPosition, this.howMany, this.sourcePosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 * @returns {module:engine/model/operation/removeoperation~RemoveOperation}
	 */
	clone() {
		let removeOperation = new RemoveOperation( this.sourcePosition, this.howMany, this.baseVersion );
		removeOperation.targetPosition = Position.createFromPosition( this.targetPosition );

		return removeOperation;
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		// Insert "holder" element in graveyard root, if the operation needs it.
		if ( this._needsHolderElement ) {
			const graveyard = this.targetPosition.root;
			const holderElement = new Element( '$graveyardHolder' );

			graveyard.insertChildren( this._holderElementOffset, holderElement );

			// If the operation removes nodes that are already in graveyard, it may happen that
			// the operation's source position is invalidated by inserting new holder element into the graveyard.
			// If that's the case, we need to fix source position path.
			if ( this.sourcePosition.root == graveyard && this.sourcePosition.path[ 0 ] >= this._holderElementOffset ) {
				this.sourcePosition.path[ 0 ]++;
			}
		}

		// Then, execute as a move operation.
		return super._execute();
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RemoveOperation';
	}

	/**
	 * Creates `RemoveOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/removeoperation~RemoveOperation}
	 */
	static fromJSON( json, document ) {
		let sourcePosition = Position.fromJSON( json.sourcePosition, document );

		const removeOp = new RemoveOperation( sourcePosition, json.howMany, json.baseVersion );

		removeOp.targetPosition = Position.fromJSON( json.targetPosition, document );
		removeOp._needsHolderElement = json._needsHolderElement;

		return removeOp;
	}
}
