/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/removeoperation
 */

import MoveOperation from './moveoperation';
import ReinsertOperation from './reinsertoperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to remove a range of nodes.
 */
export default class RemoveOperation extends MoveOperation {
	/**
	 * @inheritDocs
	 */
	constructor( sourcePosition, howMany, targetPosition, baseVersion ) {
		super( sourcePosition, howMany, targetPosition, baseVersion );

		/**
		 * Remove operation cannot be applied on element that is not inside the document
		 * so this will always be a document operation.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.isDocumentOperation = true;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'remove';
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/reinsertoperation~ReinsertOperation|module:engine/model/operation/nooperation~NoOperation}
	 */
	getReversed() {
		const newTargetPosition = this.sourcePosition._getTransformedByInsertion( this.targetPosition, this.howMany );

		return new ReinsertOperation( this.getMovedRangeStart(), this.howMany, newTargetPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		super._validate();

		if ( !this.sourcePosition.root.document ) {
			/**
			 * Item that is going to be removed needs to be a {@link module:engine/model/document~Document document} child.
			 * To remove Item from detached document fragment use
			 * {@link module:engine/model/operation/detachoperation~DetachOperation DetachOperation}.
			 *
			 * @error remove-operation-on-detached-item
			 */
			throw new CKEditorError( 'remove-operation-on-detached-item: Cannot remove detached item.' );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		return super._execute();
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RemoveOperation';
	}
}
