/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type Batch from '../batch';
import type Document from '../document';
import type { Selectable } from '../selection';

/**
 * @module engine/model/operation/operation
 */

/**
 * Abstract base operation class.
 */
export default abstract class Operation {
	/**
	 * {@link module:engine/model/document~Document#version} on which operation can be applied. If you try to
	 * {@link module:engine/model/model~Model#applyOperation apply} operation with different base version than the
	 * {@link module:engine/model/document~Document#version document version} the
	 * {@link module:utils/ckeditorerror~CKEditorError model-document-applyOperation-wrong-version} error is thrown.
	 */
	public baseVersion: number | null;

	/**
	 * Defines whether operation is executed on attached or detached {@link module:engine/model/item~Item items}.
	 */
	public readonly isDocumentOperation: boolean;

	/**
	 * {@link module:engine/model/batch~Batch Batch} to which the operation is added or `null` if the operation is not
	 * added to any batch yet.
	 */
	public batch: Batch | null;

	/**
	 * Operation type.
	 */
	public readonly abstract type: string;

	/**
	 * Base operation constructor.
	 *
	 * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( baseVersion: number | null ) {
		this.baseVersion = baseVersion;
		this.isDocumentOperation = this.baseVersion !== null;
		this.batch = null;
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns Clone of this operation.
	 */
	public abstract clone(): Operation;

	/**
	 * Creates and returns a reverse operation. Reverse operation when executed right after
	 * the original operation will bring back tree model state to the point before the original
	 * operation execution. In other words, it reverses changes done by the original operation.
	 *
	 * Keep in mind that tree model state may change since executing the original operation,
	 * so reverse operation will be "outdated". In that case you will need to transform it by
	 * all operations that were executed after the original operation.
	 *
	 * @returns Reversed operation.
	 */
	public abstract getReversed(): Operation;

	/**
	 * Executes the operation - modifications described by the operation properties will be applied to the model tree.
	 *
	 * @internal
	 */
	public abstract _execute(): void;

	/**
	 * Place on which operation is going to be applied.
	 */
	public abstract target(): Selectable;

	/**
	 * Checks whether the operation's parameters are correct and the operation can be correctly executed. Throws
	 * an error if operation is not valid.
	 *
	 * @internal
	 */
	public _validate(): void {
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns Clone of this object with the operation property replaced with string.
	 */
	public toJSON(): unknown {
		// This method creates only a shallow copy, all nested objects should be defined separately.
		// See https://github.com/ckeditor/ckeditor5-engine/issues/1477.
		const json: any = Object.assign( {}, this );

		json.__className = ( this.constructor as any ).className;

		// Remove reference to the parent `Batch` to avoid circular dependencies.
		delete json.batch;

		// Only document operations are shared with other clients so it is not necessary to keep this information.
		delete json.isDocumentOperation;

		return json;
	}

	/**
	 * Name of the operation class used for serialization.
	 */
	public static get className(): string {
		return 'Operation';
	}

	/**
	 * Creates `Operation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param json Deserialized JSON object.
	 * @param doc Document on which this operation will be applied.
	 */
	public static fromJSON( json: any, document: Document ): Operation {
		return new ( this as any )( json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( this.toString() );
	// @if CK_DEBUG_ENGINE // }
}
