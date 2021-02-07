/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/operationfactory
 */

import AttributeOperation from '../operation/attributeoperation';
import InsertOperation from '../operation/insertoperation';
import MarkerOperation from '../operation/markeroperation';
import MoveOperation from '../operation/moveoperation';
import NoOperation from '../operation/nooperation';
import Operation from '../operation/operation';
import RenameOperation from '../operation/renameoperation';
import RootAttributeOperation from '../operation/rootattributeoperation';
import SplitOperation from '../operation/splitoperation';
import MergeOperation from '../operation/mergeoperation';

const operations = {};
operations[ AttributeOperation.className ] = AttributeOperation;
operations[ InsertOperation.className ] = InsertOperation;
operations[ MarkerOperation.className ] = MarkerOperation;
operations[ MoveOperation.className ] = MoveOperation;
operations[ NoOperation.className ] = NoOperation;
operations[ Operation.className ] = Operation;
operations[ RenameOperation.className ] = RenameOperation;
operations[ RootAttributeOperation.className ] = RootAttributeOperation;
operations[ SplitOperation.className ] = SplitOperation;
operations[ MergeOperation.className ] = MergeOperation;

/**
 * A factory class for creating operations.
 *
 * @abstract
 */
export default class OperationFactory {
	/**
	 * Creates an operation instance from a JSON object (parsed JSON string).
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/operation~Operation}
	 */
	static fromJSON( json, document ) {
		return operations[ json.__className ].fromJSON( json, document );
	}
}
