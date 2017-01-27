/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
import ReinsertOperation from '../operation/reinsertoperation';
import RemoveOperation from '../operation/removeoperation';
import RenameOperation from '../operation/renameoperation';
import RootAttributeOperation from '../operation/rootattributeoperation';

const operations = {};
operations[ AttributeOperation.className ] = AttributeOperation;
operations[ InsertOperation.className ] = InsertOperation;
operations[ MarkerOperation.className ] = MarkerOperation;
operations[ MoveOperation.className ] = MoveOperation;
operations[ NoOperation.className ] = NoOperation;
operations[ Operation.className ] = Operation;
operations[ ReinsertOperation.className ] = ReinsertOperation;
operations[ RemoveOperation.className ] = RemoveOperation;
operations[ RenameOperation.className ] = RenameOperation;
operations[ RootAttributeOperation.className ] = RootAttributeOperation;

/**
 * A factory class for creating operations.
 *
 * @abstract
 */
export default class OperationFactory {
	/**
	 * Creates concrete `Operation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/operation~Operation}
	 */
	static fromJSON( json, document ) {
		return operations[ json.__className ].fromJSON( json, document );
	}
}
