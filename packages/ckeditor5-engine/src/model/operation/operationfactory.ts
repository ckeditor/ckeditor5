/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/operation/operationfactory
 */

import AttributeOperation from './attributeoperation.js';
import InsertOperation from './insertoperation.js';
import MarkerOperation from './markeroperation.js';
import MoveOperation from './moveoperation.js';
import NoOperation from './nooperation.js';
import Operation from './operation.js';
import RenameOperation from './renameoperation.js';
import RootAttributeOperation from './rootattributeoperation.js';
import RootOperation from './rootoperation.js';
import SplitOperation from './splitoperation.js';
import MergeOperation from './mergeoperation.js';

import type Document from '../document.js';

const operations: {
	[ className: string ]: {
		fromJSON( json: any, document: Document ): Operation;
	};
} = {};

operations[ AttributeOperation.className ] = AttributeOperation;
operations[ InsertOperation.className ] = InsertOperation;
operations[ MarkerOperation.className ] = MarkerOperation;
operations[ MoveOperation.className ] = MoveOperation;
operations[ NoOperation.className ] = NoOperation;
operations[ Operation.className ] = Operation;
operations[ RenameOperation.className ] = RenameOperation;
operations[ RootAttributeOperation.className ] = RootAttributeOperation;
operations[ RootOperation.className ] = RootOperation;
operations[ SplitOperation.className ] = SplitOperation;
operations[ MergeOperation.className ] = MergeOperation;

/**
 * A factory class for creating operations.
 */
export default abstract class OperationFactory {
	/**
	 * Creates an operation instance from a JSON object (parsed JSON string).
	 *
	 * @param json Deserialized JSON object.
	 * @param document Document on which this operation will be applied.
	 */
	public static fromJSON( json: any, document: Document ): Operation {
		return operations[ json.__className ].fromJSON( json, document );
	}
}
