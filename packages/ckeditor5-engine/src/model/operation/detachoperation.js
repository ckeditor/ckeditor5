/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/detachoperation
 */

import Operation from './operation';
import Position from '../position';
import Range from '../range';
import { _remove } from './utils';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to permanently remove node from detached root.
 * Note this operation is only a local operation and won't be send to the other clients.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class DetachOperation extends Operation {
	/**
	 * Creates an insert operation.
	 *
	 * @param {module:engine/model/position~Position} sourcePosition
	 * Position before the first {@link module:engine/model/item~Item model item} to move.
	 * @param {Number} howMany Offset size of moved range. Moved range will start from `sourcePosition` and end at
	 * `sourcePosition` with offset shifted by `howMany`.
	 */
	constructor( sourcePosition, howMany ) {
		super( null );

		/**
		 * Position before the first {@link module:engine/model/item~Item model item} to detach.
		 *
		 * @member {module:engine/model/position~Position} #sourcePosition
		 */
		this.sourcePosition = Position.createFromPosition( sourcePosition );

		/**
		 * Offset size of moved range.
		 *
		 * @member {Number} #howMany
		 */
		this.howMany = howMany;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'detach';
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		if ( this.sourcePosition.root.document ) {
			/**
			 * Cannot detach document node.
			 * Use {@link module:engine/model/operation/removeoperation~RemoveOperation remove operation} instead.
			 *
			 * @error detach-operation-on-document-node
			 */
			throw new CKEditorError( 'detach-operation-on-document-node: Cannot detach document node.' );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		_remove( Range.createFromPositionAndShift( this.sourcePosition, this.howMany ) );
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.DetachOperation';
	}
}
