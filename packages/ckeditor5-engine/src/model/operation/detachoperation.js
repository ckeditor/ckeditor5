/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/detachoperation
 */

import Operation from './operation';
import { remove } from '../writer';
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
	 * @param {module:engine/model/range~Range} range Range to remove.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which operation can be applied.
	 */
	constructor( range, baseVersion ) {
		super( baseVersion );

		/**
		 * Node to remove.
		 *
		 * @readonly
		 * @member {module:engine/model/range~Range} #range
		 */
		this.range = range;
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
	get isDocumentOperation() {
		return false;
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		if ( this.range.root.document ) {
			/**
			 * Cannot detach document node.
			 * Use {@link module:engine/model/operation/removeoperation~RemoveOperation remove operation} instead.
			 *
			 * @error detach-operation-on-document-node
			 */
			throw new CKEditorError( 'detach-operation-on-document-node: Cannot detach document node.' );
		}

		const nodes = remove( this.range );

		return { nodes };
	}
}
