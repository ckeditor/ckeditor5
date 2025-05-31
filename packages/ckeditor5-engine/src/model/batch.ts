/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/batch
 */

import { logWarning } from '@ckeditor/ckeditor5-utils';
import type Operation from './operation/operation.js';

/**
 * A batch instance groups model changes ({@link module:engine/model/operation/operation~Operation operations}). All operations
 * grouped in a single batch can be reverted together, so you can also think about a batch as of a single undo step. If you want
 * to extend a given undo step, you can add more changes to the batch using {@link module:engine/model/model~Model#enqueueChange}:
 *
 * ```ts
 * model.enqueueChange( batch, writer => {
 * 	writer.insertText( 'foo', paragraph, 'end' );
 * } );
 * ```
 *
 * @see module:engine/model/model~Model#enqueueChange
 * @see module:engine/model/model~Model#change
 */
export default class Batch implements BatchType {
	/**
	 * An array of operations that compose this batch.
	 */
	public readonly operations: Array<Operation>;

	/**
	 * Whether the batch can be undone through the undo feature.
	 */
	public readonly isUndoable: boolean;

	/**
	 * Whether the batch includes operations created locally (`true`) or operations created on other, remote editors (`false`).
	 */
	public readonly isLocal: boolean;

	/**
	 * Whether the batch was created by the undo feature and undoes other operations.
	 */
	public readonly isUndo: boolean;

	/**
	 * Whether the batch includes operations connected with typing.
	 */
	public readonly isTyping: boolean;

	/**
	 * Creates a batch instance.
	 *
	 * @see module:engine/model/model~Model#enqueueChange
	 * @see module:engine/model/model~Model#change
	 * @param type A set of flags that specify the type of the batch. Batch type can alter how some of the features work
	 * when encountering a given `Batch` instance (for example, when a feature listens to applied operations).
	 */
	constructor( type: BatchType = {} ) {
		if ( typeof type === 'string' ) {
			type = type === 'transparent' ? { isUndoable: false } : {};

			/**
			 * The string value for a `type` property of the `Batch` constructor has been deprecated and will be removed in the near future.
			 * Please refer to the {@link module:engine/model/batch~Batch#constructor `Batch` constructor API documentation} for more
			 * information.
			 *
			 * @error batch-constructor-deprecated-string-type
			 */
			logWarning( 'batch-constructor-deprecated-string-type' );
		}

		const { isUndoable = true, isLocal = true, isUndo = false, isTyping = false } = type;

		this.operations = [];
		this.isUndoable = isUndoable;
		this.isLocal = isLocal;
		this.isUndo = isUndo;
		this.isTyping = isTyping;
	}

	/**
	 * Returns the base version of this batch, which is equal to the base version of the first operation in the batch.
	 * If there are no operations in the batch or neither operation has the base version set, it returns `null`.
	 */
	public get baseVersion(): number | null {
		for ( const op of this.operations ) {
			if ( op.baseVersion !== null ) {
				return op.baseVersion;
			}
		}

		return null;
	}

	/**
	 * Adds an operation to the batch instance.
	 *
	 * @param operation An operation to add.
	 * @returns The added operation.
	 */
	public addOperation( operation: Operation ): Operation {
		if ( operation.isDocumentOperation ) {
			// Store only document operations in the batch.
			// Non-document operations are temporary and should be discarded after they are applied.
			operation.batch = this;
			this.operations.push( operation );
		}

		return operation;
	}
}

/**
 * A set of flags that specify the type of the batch. Batch type can alter how some of the features work
 * when encountering a given `Batch` instance (for example, when a feature listens to applied operations).
 */
export interface BatchType {

	/**
	 * Whether a batch can be undone through undo feature.
	 *
	 * @default true
	 */
	isUndoable?: boolean;

	/**
	 * Whether a batch includes operations created locally (`true`) or operations created on
	 * other, remote editors (`false`).
	 *
	 * @default true
	 */
	isLocal?: boolean;

	/**
	 * Whether a batch was created by the undo feature and undoes other operations.
	 *
	 * @default false
	 */
	isUndo?: boolean;

	/**
	 * Whether a batch includes operations connected with a typing action.
	 *
	 * @default false
	 */
	isTyping?: boolean;
}
