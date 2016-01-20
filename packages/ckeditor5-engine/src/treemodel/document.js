/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import RootElement from './rootelement.js';
import Batch from './batch.js';
import Selection from './selection.js';
import EmitterMixin from '../emittermixin.js';
import CKEditorError from '../ckeditorerror.js';
import objectUtils from '../lib/lodash/object.js';

const graveyardSymbol = Symbol( 'graveyard' );

/**
 * Document tree model describes all editable data in the editor. It may contain multiple {@link #roots root elements},
 * for example if the editor have multiple editable areas, each area will be represented by the separate root.
 *
 * All changes in the document are done by {@link treeModel.operation.Operation operations}. To create operations in
 * the simple way use use the {@link treeModel.Batch} API, for example:
 *
 *		doc.batch().insert( position, nodes ).split( otherPosition );
 *
 * @see #batch
 *
 * @class treeModel.Document
 */
export default class Document {
	/**
	 * Creates an empty document instance with no {@link #roots} (other than graveyard).
	 *
	 * @constructor
	 */
	constructor() {
		/**
		 * List of roots that are owned and managed by this document.
		 *
		 * @readonly
		 * @property {Map} roots
		 */
		this.roots = new Map();

		/**
		 * Document version. It starts from `0` and every operation increases the version number. It is used to ensure that
		 * operations are applied on the proper document version. If the {@link treeModel.operation.Operation#baseVersion} will
		 * not match document version the {@link document-applyOperation-wrong-version} error is thrown.
		 *
		 * @readonly
		 * @property {Number} version
		 */
		this.version = 0;

		// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		this.createRoot( graveyardSymbol );

		/**
		 * Array of pending changes. See: {@link #enqueueChanges}.
		 *
		 * @private
		 * @property {Array.<Function>}
		 */
		this._pendingChanges = [];

		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @property {treeModel.Selection}
		 */
		this.selection = new Selection();
	}

	/**
	 * Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
	 *
	 * @readonly
	 * @property {treeModel.RootElement} graveyard
	 */
	get graveyard() {
		return this.getRoot( graveyardSymbol );
	}

	/**
	 * This is the entry point for all document changes. All changes on the document are done using
	 * {@link treeModel.operation.Operation operations}. To create operations in the simple way use the
	 * {@link treeModel.Batch} API available via {@link #batch} method.
	 *
	 * This method calls {@link #change} event.
	 *
	 * @param {treeModel.operation.Operation} operation Operation to be applied.
	 */
	applyOperation( operation ) {
		if ( operation.baseVersion !== this.version ) {
			/**
			 * Only operations with matching versions can be applied.
			 *
			 * @error document-applyOperation-wrong-version
			 * @param {treeModel.operation.Operation} operation
			 */
			throw new CKEditorError(
				'document-applyOperation-wrong-version: Only operations with matching versions can be applied.',
				{ operation: operation } );
		}

		let changes = operation._execute();

		this.version++;

		const batch = operation.delta && operation.delta.batch;
		this.fire( 'change', operation.type, changes, batch );
	}

	/**
	 * Creates a {@link treeModel.Batch} instance which allows to change the document.
	 *
	 * @returns {treeModel.Batch} Batch instance.
	 */
	batch() {
		return new Batch( this );
	}

	/**
	 * Creates a new top-level root.
	 *
	 * @param {String|Symbol} name Unique root name.
	 * @returns {treeModel.RootElement} Created root.
	 */
	createRoot( name ) {
		if ( this.roots.has( name ) ) {
			/**
			 * Root with specified name already exists.
			 *
			 * @error document-createRoot-name-exists
			 * @param {treeModel.Document} doc
			 * @param {String} name
			 */
			throw new CKEditorError(
				'document-createRoot-name-exists: Root with specified name already exists.',
				{ name: name }
			);
		}

		const root = new RootElement( this );
		this.roots.set( name, root );

		return root;
	}

	/**
	 * Enqueue a callback with document changes. Any changes to be done on document (mostly using {@link #batch} should
	 * be placed in the queued callback. If no other plugin is changing document at the moment, the callback will be
	 * called immediately. Otherwise it will wait for all previously queued changes to finish happening. This way
	 * queued callback will not interrupt other callbacks.
	 *
	 * When all queued changes are done {@link #changesDone} event is fired.
	 *
	 * @param {Function} callback Callback to enqueue.
	 */
	enqueueChanges( callback ) {
		this._pendingChanges.push( callback );

		if ( this._pendingChanges.length == 1 ) {
			while ( this._pendingChanges.length ) {
				this._pendingChanges[ 0 ]();
				this._pendingChanges.shift();
			}

			this.fire( 'changesDone' );
		}
	}

	/**
	 * Returns top-level root by it's name.
	 *
	 * @param {String|Symbol} name Name of the root to get.
	 * @returns {treeModel.RootElement} Root registered under given name.
	 */
	getRoot( name ) {
		if ( !this.roots.has( name ) ) {
			/**
			 * Root with specified name does not exist.
			 *
			 * @error document-createRoot-root-not-exist
			 * @param {String} name
			 */
			throw new CKEditorError(
				'document-createRoot-root-not-exist: Root with specified name does not exist.',
				{ name: name }
			);
		}

		return this.roots.get( name );
	}

	/**
	 * Fired when document changes by applying an operation.
	 *
	 * There are 5 types of change:
	 *
	 * * 'insert' when nodes are inserted,
	 * * 'remove' when nodes are removed,
	 * * 'reinsert' when remove is undone,
	 * * 'move' when nodes are moved,
	 * * 'attr' when attributes change.
	 *
	 * Change event is fired after the change is done. This means that any ranges or positions passed in
	 * `changeInfo` are referencing nodes and paths in updated tree model.
	 *
	 * @event change
	 * @param {String} type Change type, possible option: 'insert', 'remove', 'reinsert', 'move', 'attr'.
	 * @param {Object} changeInfo Additional information about the change.
	 * @param {treeModel.Range} changeInfo.range Range containing changed nodes. Note that for 'remove' the range will be in the
	 * {@link #graveyard graveyard root}.
	 * @param {treeModel.Position} [changeInfo.sourcePosition] Change source position. Exists for 'remove', 'reinsert' and 'move'.
	 * Note that for 'reinsert' the source position will be in the {@link #graveyard graveyard root}.
	 * @param {treeModel.Attribute} [changeInfo.oldAttr] Only for 'attr' type. If the type is 'attr' and `oldAttr`
	 * is `undefined` it means that new attribute was inserted. Otherwise it contains changed or removed attribute.
	 * @param {treeModel.Attribute} [changeInfo.newAttr] Only for 'attr' type. If the type is 'attr' and `newAttr`
	 * is `undefined` it means that attribute was removed. Otherwise it contains changed or inserted attribute.
	 * @param {treeModel.Batch} {@link treeModel.Batch} of changes which this change is a part of.
	 */

	/**
	 * Fired when all queued document changes are done. See {@link #enqueueChanges}.
	 *
	 * @event changesDone
	 */
}

objectUtils.extend( Document.prototype, EmitterMixin );
