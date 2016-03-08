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
import utils from '../utils.js';

const graveyardSymbol = Symbol( 'graveyard' );

/**
 * Document tree model describes all editable data in the editor. It may contain multiple
 * {@link core.treeModel.Document#roots root elements}, for example if the editor have multiple editable areas, each area will be
 * represented by the separate root.
 *
 * All changes in the document are done by {@link core.treeModel.operation.Operation operations}. To create operations in
 * the simple way use use the {@link core.treeModel.Batch} API, for example:
 *
 *		doc.batch().insert( position, nodes ).split( otherPosition );
 *
 * @see core.treeModel.Document#batch
 *
 * @memberOf core.treeModel
 */
export default class Document {
	/**
	 * Creates an empty document instance with no {@link core.treeModel.Document#roots} (other than graveyard).
	 */
	constructor() {
		/**
		 * List of roots that are owned and managed by this document.
		 *
		 * @readonly
		 * @member {Map} core.treeModel.Document#roots
		 */
		this.roots = new Map();

		/**
		 * Document version. It starts from `0` and every operation increases the version number. It is used to ensure that
		 * operations are applied on the proper document version. If the {@link core.treeModel.operation.Operation#baseVersion} will
		 * not match document version the {@link document-applyOperation-wrong-version} error is thrown.
		 *
		 * @readonly
		 * @member {Number} core.treeModel.Document#version
		 */
		this.version = 0;

		// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		this.createRoot( graveyardSymbol );

		/**
		 * Array of pending changes. See: {@link core.treeModel.Document#enqueueChanges}.
		 *
		 * @private
		 * @member {Array.<Function>} core.treeModel.Document#_pendingChanges
		 */
		this._pendingChanges = [];

		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @member {core.treeModel.Selection} core.treeModel.Document#selection
		 */
		this.selection = new Selection();
	}

	/**
	 * Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
	 *
	 * @readonly
	 * @type {core.treeModel.RootElement}
	 */
	get graveyard() {
		return this.getRoot( graveyardSymbol );
	}

	/**
	 * This is the entry point for all document changes. All changes on the document are done using
	 * {@link core.treeModel.operation.Operation operations}. To create operations in the simple way use the
	 * {@link core.treeModel.Batch} API available via {@link core.treeModel.Document#batch} method.
	 *
	 * This method calls {@link core.treeModel.Document#change} event.
	 *
	 * @param {core.treeModel.operation.Operation} operation Operation to be applied.
	 */
	applyOperation( operation ) {
		if ( operation.baseVersion !== this.version ) {
			/**
			 * Only operations with matching versions can be applied.
			 *
			 * @error document-applyOperation-wrong-version
			 * @param {core.treeModel.operation.Operation} operation
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
	 * Creates a {@link core.treeModel.Batch} instance which allows to change the document.
	 *
	 * @returns {core.treeModel.Batch} Batch instance.
	 */
	batch() {
		return new Batch( this );
	}

	/**
	 * Creates a new top-level root.
	 *
	 * @param {String|Symbol} name Unique root name.
	 * @returns {core.treeModel.RootElement} Created root.
	 */
	createRoot( name ) {
		if ( this.roots.has( name ) ) {
			/**
			 * Root with specified name already exists.
			 *
			 * @error document-createRoot-name-exists
			 * @param {core.treeModel.Document} doc
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
	 * Enqueue a callback with document changes. Any changes to be done on document (mostly using {@link core.treeModel.Document#batch} should
	 * be placed in the queued callback. If no other plugin is changing document at the moment, the callback will be
	 * called immediately. Otherwise it will wait for all previously queued changes to finish happening. This way
	 * queued callback will not interrupt other callbacks.
	 *
	 * When all queued changes are done {@link core.treeModel.Document#changesDone} event is fired.
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
	 * @returns {core.treeModel.RootElement} Root registered under given name.
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
	 * * `'insert'` when nodes are inserted,
	 * * `'remove'` when nodes are removed,
	 * * `'reinsert'` when remove is undone,
	 * * `'move'` when nodes are moved,
	 * * `'attribute'` when attributes change. TODO attribute
	 *
	 * Change event is fired after the change is done. This means that any ranges or positions passed in
	 * `changeInfo` are referencing nodes and paths in updated tree model.
	 *
	 * @event core.treeModel.Document#change
	 * @param {String} type Change type, possible option: `'insert'`, `'remove'`, `'reinsert'`, `'move'`, `'attribute'`.
	 * @param {Object} changeInfo Additional information about the change.
	 * @param {core.treeModel.Range} changeInfo.range Range containing changed nodes. Note that for `'remove'` the range will be in the
	 * {@link core.treeModel.Document#graveyard graveyard root}.
	 * @param {core.treeModel.Position} [changeInfo.sourcePosition] Change source position. Exists for `'remove'`, `'reinsert'` and `'move'`.
	 * Note that for 'reinsert' the source position will be in the {@link core.treeModel.Document#graveyard graveyard root}.
	 * @param {String} [changeInfo.key] Only for `'attribute'` type. Key of changed / inserted / removed attribute.
	 * @param {*} [changeInfo.oldValue] Only for `'attribute'` type. If the type is `'attribute'` and `oldValue`
	 * is `undefined` it means that new attribute was inserted. Otherwise it contains changed or removed attribute value.
	 * @param {*} [changeInfo.newValue] Only for `'attribute'` type. If the type is `'attribute'` and `newValue`
	 * is `undefined` it means that attribute was removed. Otherwise it contains changed or inserted attribute value.
	 * @param {core.treeModel.Batch} batch A {@link core.treeModel.Batch batch} of changes which this change is a part of.
	 */

	/**
	 * Fired when all queued document changes are done. See {@link core.treeModel.Document#enqueueChanges}.
	 *
	 * @event core.treeModel.Document#changesDone
	 */
}

utils.mix( Document, EmitterMixin );
