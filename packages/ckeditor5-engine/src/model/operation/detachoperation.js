/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/detachoperation
 */

import Operation from './operation';
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
		this.sourcePosition = sourcePosition.clone();

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
	toJSON() {
		const json = super.toJSON();

		json.sourcePosition = this.sourcePosition.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		if ( this.sourcePosition.root.document ) {
			/**
			 * Cannot detach document node.
			 *
			 * @error detach-operation-on-document-node
			 */
			throw new CKEditorError( 'detach-operation-on-document-node: Cannot detach document node.', this );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		_remove( Range._createFromPositionAndShift( this.sourcePosition, this.howMany ) );
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'DetachOperation';
	}
}
