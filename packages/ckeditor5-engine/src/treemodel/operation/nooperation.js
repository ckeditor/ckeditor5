/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Operation from './operation.js';

/**
 * Operation which is doing nothing ("empty operation", "do-nothing operation", "noop").
 * This is an operation, which when executed does not change the tree model.
 * It still has some parameters defined for transformation purposes.
 *
 * In most cases this operation is a result of transforming operations. When transformation returns
 * {@link treeModel.operation.NoOperation} it means that changes done by the transformed operation
 * have already been applied.
 *
 * @class treeModel.operation.NoOperation
 */
export default class NoOperation extends Operation {
	clone() {
		return new NoOperation( this.baseVersion );
	}

	getReversed() {
		return new NoOperation( this.baseVersion + 1 );
	}

	_execute() {
		// Do nothing.
	}
}
