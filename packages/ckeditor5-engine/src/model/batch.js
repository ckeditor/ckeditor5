/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/batch
 */

import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * A batch instance groups model changes ({@link module:engine/model/operation/operation~Operation operations}). All operations
 * grouped in a single batch can be reverted together, so you can also think about a batch as of a single undo step. If you want
 * to extend a given undo step, you can add more changes to the batch using {@link module:engine/model/model~Model#enqueueChange}:
 *
 *		model.enqueueChange( batch, writer => {
 *			writer.insertText( 'foo', paragraph, 'end' );
 *		} );
 *
 * @see module:engine/model/model~Model#enqueueChange
 * @see module:engine/model/model~Model#change
 */
export default class Batch {
	/**
	 * Creates a batch instance.
	 *
	 * @see module:engine/model/model~Model#enqueueChange
	 * @see module:engine/model/model~Model#change
	 * @param {Object} [type] Set of flags that specifies the type of the batch. Batch type can alter how some of the features work when
	 * encountering given `Batch` instance (for example, when a feature listens to applied operations).
	 * @param {Boolean} [type.isUndoable=true] Whether batch can be undone through undo feature.
	 * @param {Boolean} [type.isLocal=true] Whether batch includes operations created locally (`true`) or operations created on
	 * other, remote editors (`false`).
	 * @param {Boolean} [type.isUndo=false] Whether batch was created by the undo feature and undoes other operations.
	 * @param {Boolean} [type.isTyping=false] Whether batch includes operations connected with typing action.
	 */
	constructor( type = {} ) {
		if ( typeof type === 'string' ) {
			type = type === 'transparent' ? { isUndoable: false } : {};

			/**
			 * The string value for {@link module:engine/model/batch~Batch#type `type`} constructor property has been
			 * deprecated and will be removed in the near future. Please refer to the API documentation for more information.
			 *
			 * @error batch-constructor-deprecated-string-type
			 */
			logWarning( 'batch-constructor-deprecated-string-type' );
		}

		const { isUndoable = true, isLocal = true, isUndo = false, isTyping = false } = type;

		/**
		 * An array of operations that compose this batch.
		 *
		 * @readonly
		 * @type {Array.<module:engine/model/operation/operation~Operation>}
		 */
		this.operations = [];

		/**
		 * Whether batch can be undone through the undo feature.
		 *
		 * @readonly
		 * @type {Boolean}
		 */
		this.isUndoable = isUndoable;

		/**
		 * Whether batch includes operations created locally (`true`) or operations created on other, remote editors (`false`).
		 *
		 * @readonly
		 * @type {Boolean}
		 */
		this.isLocal = isLocal;

		/**
		 * Whether batch was created by the undo feature and undoes other operations.
		 *
		 * @readonly
		 * @type {Boolean}
		 */
		this.isUndo = isUndo;

		/**
		 * Whether batch includes operations connected with typing.
		 *
		 * @readonly
		 * @type {Boolean}
		 */
		this.isTyping = isTyping;
	}

	/**
	 * Returns the base version of this batch, which is equal to the base version of the first operation in the batch.
	 * If there are no operations in the batch or neither operation has the base version set, it returns `null`.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get baseVersion() {
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
	 * @param {module:engine/model/operation/operation~Operation} operation An operation to add.
	 * @returns {module:engine/model/operation/operation~Operation} The added operation.
	 */
	addOperation( operation ) {
		operation.batch = this;
		this.operations.push( operation );

		return operation;
	}
}
