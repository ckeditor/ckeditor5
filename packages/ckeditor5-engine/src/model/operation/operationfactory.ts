/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/operationfactory
 */

import AttributeOperation from './attributeoperation';
import InsertOperation from './insertoperation';
import MarkerOperation from './markeroperation';
import MoveOperation from './moveoperation';
import NoOperation from './nooperation';
import Operation from './operation';
import RenameOperation from './renameoperation';
import RootAttributeOperation from './rootattributeoperation';
import RootOperation from './rootoperation';
import SplitOperation from './splitoperation';
import MergeOperation from './mergeoperation';

import type Document from '../document';

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
		// TODO: Temporary solution to be able to pass `RootOperation` data to remote clients.
		// TODO: The `RootOperation` is currently not handled by operations compressor, so it is compressed as a `RootAttributeOperation`.
		if ( json.__className === 'RootAttributeOperation' && json.key.startsWith( '$$' ) ) {
			return operations.RootOperation.fromJSON( json, document );
		}

		return operations[ json.__className ].fromJSON( json, document );
	}
}
