/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// Load all basic deltas and transformations, they register themselves, but they need to be imported somewhere.
import deltas from './delta/basic-deltas.js'; // jshint ignore:line
import transformations from './delta/basic-transformations.js'; // jshint ignore:line

import RootElement from './rootelement.js';
import Batch from './batch.js';
import History from './history.js';
import Selection from './selection.js';
import EmitterMixin from '../../utils/emittermixin.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import mix from '../../utils/mix.js';
import Schema from './schema.js';
import Composer from './composer/composer.js';
import clone from '../../utils/lib/lodash/clone.js';

const graveyardSymbol = Symbol( 'graveyard' );

/**
 * Document tree model describes all editable data in the editor. It may contain multiple
 * {@link engine.treeModel.Document#roots root elements}, for example if the editor have multiple editable areas, each area will be
 * represented by the separate root.
 *
 * All changes in the document are done by {@link engine.treeModel.operation.Operation operations}. To create operations in
 * the simple way use use the {@link engine.treeModel.Batch} API, for example:
 *
 *		doc.batch().insert( position, nodes ).split( otherPosition );
 *
 * @see engine.treeModel.Document#batch
 *
 * @memberOf engine.treeModel
 */
export default class Document {
	/**
	 * Creates an empty document instance with no {@link engine.treeModel.Document#roots} (other than graveyard).
	 */
	constructor() {
		/**
		 * Document version. It starts from `0` and every operation increases the version number. It is used to ensure that
		 * operations are applied on the proper document version. If the {@link engine.treeModel.operation.Operation#baseVersion} will
		 * not match document version the {@link document-applyOperation-wrong-version} error is thrown.
		 *
		 * @readonly
		 * @member {Number} engine.treeModel.Document#version
		 */
		this.version = 0;

		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @member {engine.treeModel.Selection} engine.treeModel.Document#selection
		 */
		this.selection = new Selection( this );

		/**
		 * Schema for this document.
		 *
		 * @member {engine.treeModel.Schema} engine.treeModel.Document#schema
		 */
		this.schema = new Schema();

		/**
		 * Composer for this document. Set of tools to work with the document.
		 *
		 * The features can tune up these tools to better work on their specific cases.
		 *
		 * @member {engine.treeModel.composer.Composer} engine.treeModel.Document#composer
		 */
		this.composer = new Composer();

		/**
		 * Array of pending changes. See: {@link engine.treeModel.Document#enqueueChanges}.
		 *
		 * @private
		 * @member {Array.<Function>} engine.treeModel.Document#_pendingChanges
		 */
		this._pendingChanges = [];

		/**
		 * List of roots that are owned and managed by this document. Use {@link engine.treeModel.document#createRoot} and
		 * {@link engine.treeModel.document#getRoot} to manipulate it.
		 *
		 * @readonly
		 * @protected
		 * @member {Map} engine.treeModel.Document#roots
		 */
		this._roots = new Map();

		// Add events that will update selection attributes.
		this.selection.on( 'change:range', () => {
			this.selection._updateAttributes();
		} );

		this.on( 'changesDone', () => {
			this.selection._updateAttributes();
		} );

		// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		this.createRoot( graveyardSymbol );

		/**
		 * Document's history.
		 *
		 * @readonly
		 * @member {engine.treeModel.History} engine.treeModel.Document#history
		 */
		this.history = new History();
	}

	/**
	 * Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
	 *
	 * @readonly
	 * @type {engine.treeModel.RootElement}
	 */
	get graveyard() {
		return this.getRoot( graveyardSymbol );
	}

	/**
	 * Gets names of all roots (without the {@link engine.treeModel.Document#graveyard}).
	 *
	 * @readonly
	 * @type {Iterable.<String>}
	 */
	get rootNames() {
		return Array.from( this._roots.keys() ).filter( ( name ) => name != graveyardSymbol );
	}

	/**
	 * This is the entry point for all document changes. All changes on the document are done using
	 * {@link engine.treeModel.operation.Operation operations}. To create operations in the simple way use the
	 * {@link engine.treeModel.Batch} API available via {@link engine.treeModel.Document#batch} method.
	 *
	 * @fires @link engine.treeModel.Document#change
	 * @param {engine.treeModel.operation.Operation} operation Operation to be applied.
	 */
	applyOperation( operation ) {
		if ( operation.baseVersion !== this.version ) {
			/**
			 * Only operations with matching versions can be applied.
			 *
			 * @error document-applyOperation-wrong-version
			 * @param {engine.treeModel.operation.Operation} operation
			 */
			throw new CKEditorError(
				'document-applyOperation-wrong-version: Only operations with matching versions can be applied.',
				{ operation: operation } );
		}

		let changes = operation._execute();

		this.version++;

		this.history.addOperation( operation );

		const batch = operation.delta && operation.delta.batch;

		if ( changes ) {
			// `NoOperation` returns no changes, do not fire event for it.
			this.fire( 'change', operation.type, changes, batch );
		}
	}

	/**
	 * Creates a {@link engine.treeModel.Batch} instance which allows to change the document.
	 *
	 * @returns {engine.treeModel.Batch} Batch instance.
	 */
	batch() {
		return new Batch( this );
	}

	/**
	 * Creates a new top-level root.
	 *
	 * @param {String|Symbol} rootName Unique root name.
	 * @param {String} [elementName='$root'] Element name. Defaults to `'$root'` which also have
	 * some basic schema defined (`$block`s are allowed inside the `$root`). Make sure to define a proper
	 * schema if you use a different name.
	 * @returns {engine.treeModel.RootElement} Created root.
	 */
	createRoot( rootName, elementName = '$root' ) {
		if ( this._roots.has( rootName ) ) {
			/**
			 * Root with specified name already exists.
			 *
			 * @error document-createRoot-name-exists
			 * @param {engine.treeModel.Document} doc
			 * @param {String} name
			 */
			throw new CKEditorError(
				'document-createRoot-name-exists: Root with specified name already exists.',
				{ name: rootName }
			);
		}

		const root = new RootElement( this, elementName, rootName );
		this._roots.set( rootName, root );

		return root;
	}

	/**
	 * Removes all events listeners set by document instance.
	 */
	destroy() {
		this.selection.destroy();
		this.stopListening();
	}

	/**
	 * Enqueues document changes. Any changes to be done on document (mostly using {@link engine.treeModel.Document#batch}
	 * should be placed in the queued callback. If no other plugin is changing document at the moment, the callback will be
	 * called immediately. Otherwise it will wait for all previously queued changes to finish happening. This way
	 * queued callback will not interrupt other callbacks.
	 *
	 * When all queued changes are done {@link engine.treeModel.Document#changesDone} event is fired.
	 *
	 * @fires @link engine.treeModel.Document#changesDone
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
	 * Returns top-level root by its name.
	 *
	 * @param {String|Symbol} name Unique root name.
	 * @returns {engine.treeModel.RootElement} Root registered under given name.
	 */
	getRoot( name ) {
		if ( !this._roots.has( name ) ) {
			/**
			 * Root with specified name does not exist.
			 *
			 * @error document-getRoot-root-not-exist
			 * @param {String} name
			 */
			throw new CKEditorError(
				'document-getRoot-root-not-exist: Root with specified name does not exist.',
				{ name: name }
			);
		}

		return this._roots.get( name );
	}

	/**
	 * Checks if root with given name is defined.
	 *
	 * @param {String} name Name of root to check.
	 * @returns {Boolean}
	 */
	hasRoot( name ) {
		return this._roots.has( name );
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the document property changed to string.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		json.selection = '[engine.treeModel.Selection]';

		return {};
	}

	/**
	 * Returns default root for this document which is either the first root that was added to the the document using
	 * {@link engine.treeModel.Document#createRoot} or the {@link engine.treeModel.Document#graveyard graveyard root} if
	 * no other roots were created.
	 *
	 * @protected
	 * @returns {engine.treeModel.RootElement} The default root for this document.
	 */
	_getDefaultRoot() {
		for ( let root of this._roots.values() ) {
			if ( root !== this.graveyard ) {
				return root;
			}
		}

		return this.graveyard;
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
	 * * 'addAttribute' when attributes are added,
	 * * 'removeAttribute' when attributes are removed,
	 * * 'changeAttribute' when attributes change,
	 * * 'addRootAttribute' when attribute for root is added,
	 * * 'removeRootAttribute' when attribute for root is removed,
	 * * 'changeRootAttribute' when attribute for root changes.
	 *
	 * @event engine.treeModel.Document.change
	 * @param {String} type Change type, possible option: 'insert', 'remove', 'reinsert', 'move', 'attribute'.
	 * @param {Object} data Additional information about the change.
	 * @param {engine.treeModel.Range} data.range Range in model containing changed nodes. Note that the range state is
	 * after changes has been done, i.e. for 'remove' the range will be in the {@link engine.treeModel.Document#graveyard graveyard root}.
	 * This is `undefined` for "...root..." types.
	 * @param {engine.treeModel.Position} [data.sourcePosition] Change source position. Exists for 'remove', 'reinsert' and 'move'.
	 * Note that this position state is before changes has been done, i.e. for 'reinsert' the source position will be in the
	 * {@link engine.treeModel.Document#graveyard graveyard root}.
	 * @param {String} [data.key] Only for attribute types. Key of changed / inserted / removed attribute.
	 * @param {*} [data.oldValue] Only for 'removeAttribute', 'removeRootAttribute', 'changeAttribute' or
	 * 'changeRootAttribute' type.
	 * @param {*} [data.newValue] Only for 'addAttribute', 'addRootAttribute', 'changeAttribute' or
	 * 'changeRootAttribute' type.
	 * @param {engine.treeModel.RootElement} [changeInfo.root] Root element which attributes got changed. This is defined
	 * only for root types.
	 * @param {engine.treeModel.Batch} batch A {@link engine.treeModel.Batch batch} of changes which this change is a part of.
	 */

	/**
	 * Fired when all queued document changes are done. See {@link engine.treeModel.Document#enqueueChanges}.
	 *
	 * @event engine.treeModel.Document#changesDone
	 */
}

mix( Document, EmitterMixin );
