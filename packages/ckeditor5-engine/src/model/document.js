/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/document
 */

// Load all basic deltas and transformations, they register themselves.
import './delta/basic-deltas';
import './delta/basic-transformations';

import Range from './range';
import Position from './position';
import RootElement from './rootelement';
import Batch from './batch';
import History from './history';
import DocumentSelection from './documentselection';
import Schema from './schema';
import TreeWalker from './treewalker';
import MarkerCollection from './markercollection';
import deltaTransform from './delta/transform';
import clone from '@ckeditor/ckeditor5-utils/src/lib/lodash/clone';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isInsideSurrogatePair, isInsideCombinedSymbol } from '@ckeditor/ckeditor5-utils/src/unicode';

const graveyardName = '$graveyard';

/**
 * Document tree model describes all editable data in the editor. It may contain multiple
 * {@link module:engine/model/document~Document#roots root elements}, for example if the editor have multiple editable areas,
 * each area will be represented by the separate root.
 *
 * All changes in the document are done by {@link module:engine/model/operation/operation~Operation operations}. To create operations in
 * a simple way, use the {@link module:engine/model/batch~Batch} API, for example:
 *
 *		doc.batch().insert( position, nodes ).split( otherPosition );
 *
 * @see module:engine/model/document~Document#batch
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class Document {
	/**
	 * Creates an empty document instance with no {@link #roots} (other than
	 * the {@link #graveyard graveyard root}).
	 */
	constructor() {
		/**
		 * Document version. It starts from `0` and every operation increases the version number. It is used to ensure that
		 * operations are applied on the proper document version.
		 * If the {@link module:engine/model/operation/operation~Operation#baseVersion} will not match document version the
		 * {@link module:utils/ckeditorerror~CKEditorError model-document-applyOperation-wrong-version} error is thrown.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.version = 0;

		/**
		 * Schema for this document.
		 *
		 * @member {module:engine/model/schema~Schema}
		 */
		this.schema = new Schema();

		/**
		 * Document's history.
		 *
		 * **Note:** Be aware that deltas applied to the document might get removed or changed.
		 *
		 * @readonly
		 * @member {module:engine/model/history~History}
		 */
		this.history = new History( this );

		/**
		 * Document's markers' collection.
		 *
		 * @readonly
		 * @member {module:engine/model/markercollection~MarkerCollection}
		 */
		this.markers = new MarkerCollection();

		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @member {module:engine/model/documentselection~DocumentSelection}
		 */
		this.selection = new DocumentSelection( this );

		/**
		 * Array of pending changes. See: {@link #enqueueChanges}.
		 *
		 * @private
		 * @member {Array.<Function>}
		 */
		this._pendingChanges = [];

		/**
		 * List of roots that are owned and managed by this document. Use {@link #createRoot} and
		 * {@link #getRoot} to manipulate it.
		 *
		 * @readonly
		 * @member {Map}
		 */
		this.roots = new Map();

		// Add events that will ensure selection correctness.
		this.selection.on( 'change:range', () => {
			for ( const range of this.selection.getRanges() ) {
				if ( !this._validateSelectionRange( range ) ) {
					/**
					 * Range from {@link module:engine/model/documentselection~DocumentSelection document selection}
					 * starts or ends at incorrect position.
					 *
					 * @error document-selection-wrong-position
					 * @param {module:engine/model/range~Range} range
					 */
					throw new CKEditorError( 'document-selection-wrong-position: ' +
						'Range from document selection starts or ends at incorrect position.', { range } );
				}
			}
		} );

		// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		this.createRoot( '$root', graveyardName );
	}

	/**
	 * Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
	 *
	 * @readonly
	 * @member {module:engine/model/rootelement~RootElement}
	 */
	get graveyard() {
		return this.getRoot( graveyardName );
	}

	/**
	 * This is the entry point for all document changes. All changes on the document are done using
	 * {@link module:engine/model/operation/operation~Operation operations}. To create operations in the simple way use the
	 * {@link module:engine/model/batch~Batch} API available via {@link #batch} method.
	 *
	 * @fires event:change
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to be applied.
	 */
	applyOperation( operation ) {
		if ( operation.baseVersion !== this.version ) {
			/**
			 * Only operations with matching versions can be applied.
			 *
			 * @error document-applyOperation-wrong-version
			 * @param {module:engine/model/operation/operation~Operation} operation
			 */
			throw new CKEditorError(
				'model-document-applyOperation-wrong-version: Only operations with matching versions can be applied.',
				{ operation } );
		}

		const changes = operation._execute();

		this.version++;

		this.history.addDelta( operation.delta );

		this.fire( 'change', operation.type, changes, operation.delta.batch, operation.delta.type );
	}

	/**
	 * Creates a {@link module:engine/model/batch~Batch} instance which allows to change the document.
	 *
	 * @param {String} [type] Batch type. See {@link module:engine/model/batch~Batch#type}.
	 * @returns {module:engine/model/batch~Batch} Batch instance.
	 */
	batch( type ) {
		return new Batch( this, type );
	}

	/**
	 * Creates a new top-level root.
	 *
	 * @param {String} [elementName='$root'] Element name. Defaults to `'$root'` which also have
	 * some basic schema defined (`$block`s are allowed inside the `$root`). Make sure to define a proper
	 * schema if you use a different name.
	 * @param {String} [rootName='main'] Unique root name.
	 * @returns {module:engine/model/rootelement~RootElement} Created root.
	 */
	createRoot( elementName = '$root', rootName = 'main' ) {
		if ( this.roots.has( rootName ) ) {
			/**
			 * Root with specified name already exists.
			 *
			 * @error model-document-createRoot-name-exists
			 * @param {module:engine/model/document~Document} doc
			 * @param {String} name
			 */
			throw new CKEditorError(
				'model-document-createRoot-name-exists: Root with specified name already exists.',
				{ name: rootName }
			);
		}

		const root = new RootElement( this, elementName, rootName );
		this.roots.set( rootName, root );

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
	 * Enqueues document changes. Any changes to be done on document (mostly using {@link #batch}
	 * should be placed in the queued callback. If no other plugin is changing document at the moment, the callback will be
	 * called immediately. Otherwise it will wait for all previously queued changes to finish happening. This way
	 * queued callback will not interrupt other callbacks.
	 *
	 * When all queued changes are done {@link #event:changesDone} event is fired.
	 *
	 * @fires changesDone
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
	 * @param {String} [name='main'] Unique root name.
	 * @returns {module:engine/model/rootelement~RootElement} Root registered under given name.
	 */
	getRoot( name = 'main' ) {
		if ( !this.roots.has( name ) ) {
			/**
			 * Root with specified name does not exist.
			 *
			 * @error model-document-getRoot-root-not-exist
			 * @param {String} name
			 */
			throw new CKEditorError(
				'model-document-getRoot-root-not-exist: Root with specified name does not exist.',
				{ name }
			);
		}

		return this.roots.get( name );
	}

	/**
	 * Checks if root with given name is defined.
	 *
	 * @param {String} name Name of root to check.
	 * @returns {Boolean}
	 */
	hasRoot( name ) {
		return this.roots.has( name );
	}

	/**
	 * Returns array with names of all roots (without the {@link #graveyard}) added to the document.
	 *
	 * @returns {Array.<String>} Roots names.
	 */
	getRootNames() {
		return Array.from( this.roots.keys() ).filter( name => name != graveyardName );
	}

	/**
	 * Basing on given `position`, finds and returns a {@link module:engine/model/range~Range Range} instance that is
	 * nearest to that `position` and is a correct range for selection.
	 *
	 * Correct selection range might be collapsed - when it's located in position where text node can be placed.
	 * Non-collapsed range is returned when selection can be placed around element marked as "object" in
	 * {@link module:engine/model/schema~Schema schema}.
	 *
	 * Direction of searching for nearest correct selection range can be specified as:
	 * * `both` - searching will be performed in both ways,
	 * * `forward` - searching will be performed only forward,
	 * * `backward` - searching will be performed only backward.
	 *
	 * When valid selection range cannot be found, `null` is returned.
	 *
	 * @param {module:engine/model/position~Position} position Reference position where new selection range should be looked for.
	 * @param {'both'|'forward'|'backward'} [direction='both'] Search direction.
	 * @returns {module:engine/model/range~Range|null} Nearest selection range or `null` if one cannot be found.
	 */
	getNearestSelectionRange( position, direction = 'both' ) {
		// Return collapsed range if provided position is valid.
		if ( this.schema.check( { name: '$text', inside: position } ) ) {
			return new Range( position );
		}

		let backwardWalker, forwardWalker;

		if ( direction == 'both' || direction == 'backward' ) {
			backwardWalker = new TreeWalker( { startPosition: position, direction: 'backward' } );
		}

		if ( direction == 'both' || direction == 'forward' ) {
			forwardWalker = new TreeWalker( { startPosition: position } );
		}

		for ( const data of combineWalkers( backwardWalker, forwardWalker ) ) {
			const type = ( data.walker == backwardWalker ? 'elementEnd' : 'elementStart' );
			const value = data.value;

			if ( value.type == type && this.schema.objects.has( value.item.name ) ) {
				return Range.createOn( value.item );
			}

			if ( this.schema.check( { name: '$text', inside: value.nextPosition } ) ) {
				return new Range( value.nextPosition );
			}
		}

		return null;
	}

	/**
	 * Transforms two sets of deltas by themselves. Returns both transformed sets.
	 *
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltasA Array with the first set of deltas to transform. These
	 * deltas are considered more important (than `deltasB`) when resolving conflicts.
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltasB Array with the second set of deltas to transform. These
	 * deltas are considered less important (than `deltasA`) when resolving conflicts.
	 * @param {Boolean} [useContext=false] When set to `true`, transformation will store and use additional context
	 * information to guarantee more expected results. Should be used whenever deltas related to already applied
	 * deltas are transformed (for example when undoing changes).
	 * @returns {Object}
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} return.deltasA The first set of deltas transformed
	 * by the second set of deltas.
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} return.deltasB The second set of deltas transformed
	 * by the first set of deltas.
	 */
	transformDeltas( deltasA, deltasB, useContext = false ) {
		return deltaTransform.transformDeltaSets( deltasA, deltasB, useContext ? this : null );
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the document property changed to string.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		json.selection = '[engine.model.DocumentSelection]';

		return json;
	}

	/**
	 * Returns default root for this document which is either the first root that was added to the the document using
	 * {@link #createRoot} or the {@link #graveyard graveyard root} if no other roots were created.
	 *
	 * @protected
	 * @returns {module:engine/model/rootelement~RootElement} The default root for this document.
	 */
	_getDefaultRoot() {
		for ( const root of this.roots.values() ) {
			if ( root !== this.graveyard ) {
				return root;
			}
		}

		return this.graveyard;
	}

	/**
	 * Returns a default range for this selection. The default range is a collapsed range that starts and ends
	 * at the beginning of this selection's document's {@link #_getDefaultRoot default root}.
	 *
	 * @protected
	 * @returns {module:engine/model/range~Range}
	 */
	_getDefaultRange() {
		const defaultRoot = this._getDefaultRoot();

		// Find the first position where the selection can be put.
		const position = new Position( defaultRoot, [ 0 ] );
		const nearestRange = this.getNearestSelectionRange( position );

		// If valid selection range is not found - return range collapsed at the beginning of the root.
		return nearestRange || new Range( position );
	}

	/**
	 * Checks whether given {@link module:engine/model/range~Range range} is a valid range for
	 * {@link #selection document's selection}.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Range to check.
	 * @returns {Boolean} `true` if `range` is valid, `false` otherwise.
	 */
	_validateSelectionRange( range ) {
		return validateTextNodePosition( range.start ) && validateTextNodePosition( range.end );
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
	 * * 'rename' when element is renamed,
	 * * 'marker' when a marker changes (added, removed or its range is changed),
	 * * 'addAttribute' when attributes are added,
	 * * 'removeAttribute' when attributes are removed,
	 * * 'changeAttribute' when attributes change,
	 * * 'addRootAttribute' when attribute for root is added,
	 * * 'removeRootAttribute' when attribute for root is removed,
	 * * 'changeRootAttribute' when attribute for root changes.
	 *
	 * @event change
	 * @param {String} type Change type, possible option: 'insert', 'remove', 'reinsert', 'move', 'attribute'.
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/range~Range} [data.range] Range in model containing changed nodes. Note that the range state is
	 * after changes has been done, i.e. for 'remove' the range will be in the {@link #graveyard graveyard root}.
	 * The range is not defined for root, rename and marker types.
	 * @param {module:engine/model/position~Position} [data.sourcePosition] Change source position.
	 * Exists for 'remove', 'reinsert' and 'move'.
	 * Note that this position state is before changes has been done, i.e. for 'reinsert' the source position will be in the
	 * {@link #graveyard graveyard root}.
	 * @param {String} [data.key] Only for attribute types. Key of changed / inserted / removed attribute.
	 * @param {*} [data.oldValue] Only for 'removeAttribute', 'removeRootAttribute', 'changeAttribute' or
	 * 'changeRootAttribute' type.
	 * @param {*} [data.newValue] Only for 'addAttribute', 'addRootAttribute', 'changeAttribute' or
	 * 'changeRootAttribute' type.
	 * @param {module:engine/model/rootelement~RootElement} [data.root] Root element which attributes got changed. This is defined
	 * only for root types.
	 * @param {module:engine/model/batch~Batch} batch A {@link module:engine/model/batch~Batch batch}
	 * of changes which this change is a part of.
	 */

	/**
	 * Fired when all queued document changes are done. See {@link #enqueueChanges}.
	 *
	 * @event changesDone
	 */
}

mix( Document, EmitterMixin );

// Checks whether given range boundary position is valid for document selection, meaning that is not between
// unicode surrogate pairs or base character and combining marks.
function validateTextNodePosition( rangeBoundary ) {
	const textNode = rangeBoundary.textNode;

	if ( textNode ) {
		const data = textNode.data;
		const offset = rangeBoundary.offset - textNode.startOffset;

		return !isInsideSurrogatePair( data, offset ) && !isInsideCombinedSymbol( data, offset );
	}

	return true;
}

// Generator function returning values from provided walkers, switching between them at each iteration. If only one walker
// is provided it will return data only from that walker.
//
// @param {module:engine/module/treewalker~TreeWalker} [backward] Walker iterating in backward direction.
// @param {module:engine/module/treewalker~TreeWalker} [forward] Walker iterating in forward direction.
// @returns {Iterable.<Object>} Object returned at each iteration contains `value` and `walker` (informing which walker returned
// given value) fields.
function* combineWalkers( backward, forward ) {
	let done = false;

	while ( !done ) {
		done = true;

		if ( backward ) {
			const step = backward.next();

			if ( !step.done ) {
				done = false;
				yield{
					walker: backward,
					value: step.value
				};
			}
		}

		if ( forward ) {
			const step = forward.next();

			if ( !step.done ) {
				done = false;
				yield{
					walker: forward,
					value: step.value
				};
			}
		}
	}
}
