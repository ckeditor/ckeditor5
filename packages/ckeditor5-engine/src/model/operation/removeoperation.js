/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import MoveOperation from './moveoperation.js';
import Position from '../position.js';
import Element from '../element.js';
import ReinsertOperation from './reinsertoperation.js';

/**
 * Operation to remove a range of nodes.
 *
 * @memberOf engine.model.operation
 * @extends engine.model.operation.Operation
 */
export default class RemoveOperation extends MoveOperation {
	/**
	 *
	 * Creates a remove operation.
	 *
	 * @param {engine.model.Position} position Position before the first node to remove.
	 * @param {Number} howMany How many nodes to remove.
	 * @param {Number} baseVersion {@link engine.model.Document#version} on which operation can be applied.
	 */
	constructor( position, howMany, baseVersion ) {
		const graveyard = position.root.document.graveyard;

		super( position, howMany, new Position( graveyard, [ graveyard.getChildCount(), 0 ] ), baseVersion );
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'remove';
	}

	/**
	 * Returns the offset of graveyard "holder" element, in which nodes removed by this operation are stored.
	 *
	 * @private
	 * @type {Number}
	 */
	get _holderElementOffset() {
		return this.targetPosition.path[ 0 ];
	}

	/**
	 * Flag informing whether this operation should insert "holder" element (`true`) or should remove nodes
	 * into existing "holder" element (`false`). It is `true` for each `RemoveOperation` that is the first `RemoveOperation`
	 * in it's delta which points to given holder element.
	 *
	 * @protected
	 * @type {Boolean}
	 */
	get _insertHolderElement() {
		if ( this.delta ) {
			for ( let operation of this.delta.operations ) {
				if ( operation instanceof RemoveOperation ) {
					if ( operation == this ) {
						return true;
					} else if ( operation._holderElementOffset == this._holderElementOffset ) {
						return false;
					}
				}
			}
		}

		return true;
	}

	/**
	 * @returns {engine.model.operation.ReinsertOperation}
	 */
	getReversed() {
		return new ReinsertOperation( this.targetPosition, this.howMany, this.sourcePosition, this.baseVersion + 1 );
	}

	/**
	 * @returns {engine.model.operation.RemoveOperation}
	 */
	clone() {
		let removeOperation = new RemoveOperation( this.sourcePosition, this.howMany, this.baseVersion );
		removeOperation.targetPosition = Position.createFromPosition( this.targetPosition );
		removeOperation.movedRangeStart = Position.createFromPosition( this.movedRangeStart );

		return removeOperation;
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		if ( this._insertHolderElement ) {
			const graveyard = this.targetPosition.root;
			const holderElement = new Element( '$graveyardHolder' );

			graveyard.insertChildren( this.targetPosition.path[ 0 ], holderElement );
		}

		return super._execute();
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RemoveOperation';
	}
}
