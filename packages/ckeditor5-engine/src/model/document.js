/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/document
 */

import Differ from './differ';
import Range from './range';
import Position from './position';
import RootElement from './rootelement';
import History from './history';
import DocumentSelection from './documentselection';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import clone from '@ckeditor/ckeditor5-utils/src/lib/lodash/clone';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isInsideSurrogatePair, isInsideCombinedSymbol } from '@ckeditor/ckeditor5-utils/src/unicode';

const graveyardName = '$graveyard';

/**
 * Document tree model describes all editable data in the editor. It may contain multiple
 * {@link module:engine/model/document~Document#roots root elements}. For example, if the editor has multiple editable areas,
 * each area will be represented by a separate root.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class Document {
	/**
	 * Creates an empty document instance with no {@link #roots} (other than
	 * the {@link #graveyard graveyard root}).
	 */
	constructor( model ) {
		/**
		 * The {@link module:engine/model/model~Model model} that the document is a part of.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * The document version. It starts from `0` and every operation increases the version number. It is used to ensure that
		 * operations are applied on a proper document version.
		 * If the {@link module:engine/model/operation/operation~Operation#baseVersion base version} does not match the document version,
		 * a {@link module:utils/ckeditorerror~CKEditorError model-document-applyOperation-wrong-version} error is thrown.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.version = 0;

		/**
		 * The document's history.
		 *
		 * **Note:** Be aware that deltas applied to the document might get removed or changed.
		 *
		 * @readonly
		 * @member {module:engine/model/history~History}
		 */
		this.history = new History( this );

		/**
		 * The selection done on this document.
		 *
		 * @readonly
		 * @member {module:engine/model/documentselection~DocumentSelection}
		 */
		this.selection = new DocumentSelection( this );

		/**
		 * A list of roots that are owned and managed by this document. Use {@link #createRoot} and
		 * {@link #getRoot} to manipulate it.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection}
		 */
		this.roots = new Collection( { idProperty: 'rootName' } );

		/**
		 * The model differ object. Its role is to buffer changes done on the model document and then calculate a diff of those changes.
		 *
		 * @readonly
		 * @member {module:engine/model/differ~Differ}
		 */
		this.differ = new Differ();

		/**
		 * Post-fixer callbacks registered to the model document.
		 *
		 * @private
		 * @member {Set}
		 */
		this._postFixers = new Set();

		// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		this.createRoot( '$root', graveyardName );

		// First, if the operation is a document operation check if it's base version is correct.
		this.listenTo( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.isDocumentOperation && operation.baseVersion !== this.version ) {
				/**
				 * Only operations with matching versions can be applied.
				 *
				 * @error document-applyOperation-wrong-version
				 * @param {module:engine/model/operation/operation~Operation} operation
				 */
				throw new CKEditorError(
					'model-document-applyOperation-wrong-version: Only operations with matching versions can be applied.',
					{ operation }
				);
			}
		}, { priority: 'highest' } );

		// Then, still before an operation is applied on model, buffer the change in differ.
		this.listenTo( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.isDocumentOperation ) {
				this.differ.bufferOperation( operation );
			}
		}, { priority: 'high' } );

		// After the operation is applied, bump document's version and add the operation to the history.
		this.listenTo( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.isDocumentOperation ) {
				this.version++;
				this.history.addDelta( operation.delta );
			}
		}, { priority: 'low' } );

		// Listen to selection changes. If selection changed, mark it.
		let hasSelectionChanged = false;

		this.listenTo( this.selection, 'change', () => {
			hasSelectionChanged = true;
		} );

		// Wait for `_change` event from model, which signalizes that outermost change block has finished.
		// When this happens, check if there were any changes done on document, and if so, call post fixers,
		// fire `change` event for features and conversion and then reset the differ.
		this.listenTo( model, '_change', ( evt, writer ) => {
			if ( !this.differ.isEmpty || hasSelectionChanged ) {
				this._callPostFixers( writer );

				this.fire( 'change', writer.batch );

				this.differ.reset();
				hasSelectionChanged = false;
			}
		} );

		// Buffer marker changes.
		// This is not covered in buffering operations because markers may change outside of them (when they
		// are modified using `model.markers` collection, not through `MarkerOperation`).
		this.listenTo( model.markers, 'update', ( evt, marker, oldRange, newRange ) => {
			// Whenever marker is updated, buffer that change.
			this.differ.bufferMarkerChange( marker.name, oldRange, newRange );

			if ( !oldRange ) {
				// Whenever marker changes, buffer that.
				marker.on( 'change', ( evt, oldRange ) => {
					this.differ.bufferMarkerChange( marker.name, oldRange, marker.getRange() );
				} );
			}
		} );
	}

	/**
	 * The graveyard tree root. A document always has a graveyard root that stores removed nodes.
	 *
	 * @readonly
	 * @member {module:engine/model/rootelement~RootElement}
	 */
	get graveyard() {
		return this.getRoot( graveyardName );
	}

	/**
	 * Creates a new top-level root.
	 *
	 * @param {String} [elementName='$root'] The element name. Defaults to `'$root'` which also has some basic schema defined
	 * (`$block`s are allowed inside the `$root`). Make sure to define a proper schema if you use a different name.
	 * @param {String} [rootName='main'] A unique root name.
	 * @returns {module:engine/model/rootelement~RootElement} The created root.
	 */
	createRoot( elementName = '$root', rootName = 'main' ) {
		if ( this.roots.get( rootName ) ) {
			/**
			 * A root with the specified name already exists.
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
		this.roots.add( root );

		return root;
	}

	/**
	 * Removes all event listeners set by the document instance.
	 */
	destroy() {
		this.selection.destroy();
		this.stopListening();
	}

	/**
	 * Returns the top-level root by its name.
	 *
	 * @param {String} [name='main'] A unique root name.
	 * @returns {module:engine/model/rootelement~RootElement|null} The root registered under a given name or null when
	 * there is no root with the given name.
	 */
	getRoot( name = 'main' ) {
		return this.roots.get( name );
	}

	/**
	 * Returns an array with names of all roots (without the {@link #graveyard}) added to the document.
	 *
	 * @returns {Array.<String>} Roots names.
	 */
	getRootNames() {
		return Array.from( this.roots, root => root.rootName ).filter( name => name != graveyardName );
	}

	/**
	 * Used to register a post-fixer callback. A post-fixer mechanism guarantees that the features that listen to
	 * the {@link module:engine/model/model~Model#event:_change model's change event} will operate on a correct model state.
	 *
	 * An execution of a feature may lead to an incorrect document tree state. The callbacks are used to fix the document tree after
	 * it has changed. Post-fixers are fired just after all changes from the outermost change block were applied but
	 * before the {@link module:engine/model/document~Document#event:change change event} is fired. If a post-fixer callback made
	 * a change, it should return `true`. When this happens, all post-fixers are fired again to check if something else should
	 * not be fixed in the new document tree state.
	 *
	 * As a parameter, a post-fixer callback receives a {@link module:engine/model/writer~Writer writer} instance connected with the
	 * executed changes block. Thanks to that, all changes done by the callback will be added to the same
	 * {@link module:engine/model/batch~Batch batch} (and undo step) as the original changes. This makes post-fixer changes transparent
	 * for the user.
	 *
	 * An example of a post-fixer is a callback that checks if all the data were removed from the editor. If so, the
	 * callback should add an empty paragraph so that the editor is never empty:
	 *
	 *		document.registerPostFixer( writer => {
	 *			const changes = document.differ.getChanges();
	 *
	 *			// Check if the changes lead to an empty root in the editor.
	 *			for ( const entry of changes ) {
	 *				if ( entry.type == 'remove' && entry.position.root.isEmpty ) {
	 *					writer.insertElement( 'paragraph', entry.position.root, 0 );
	 *
	 *					// It is fine to return early, even if multiple roots would need to be fixed.
	 *					// All post-fixers will be fired again, so if there are more empty roots, those will be fixed, too.
	 *					return true;
	 *				}
	 *			}
	 *		} );
	 *
	 * @param {Function} postFixer
	 */
	registerPostFixer( postFixer ) {
		this._postFixers.add( postFixer );
	}

	/**
	 * A custom `toJSON()` method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} A clone of this object with the document property changed to a string.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		json.selection = '[engine.model.DocumentSelection]';
		json.model = '[engine.model.Model]';

		return json;
	}

	/**
	 * Returns the default root for this document which is either the first root that was added to the document using
	 * {@link #createRoot} or the {@link #graveyard graveyard root} if no other roots were created.
	 *
	 * @protected
	 * @returns {module:engine/model/rootelement~RootElement} The default root for this document.
	 */
	_getDefaultRoot() {
		for ( const root of this.roots ) {
			if ( root !== this.graveyard ) {
				return root;
			}
		}

		return this.graveyard;
	}

	/**
	 * Returns the default range for this selection. The default range is a collapsed range that starts and ends
	 * at the beginning of this selection's document {@link #_getDefaultRoot default root}.
	 *
	 * @protected
	 * @returns {module:engine/model/range~Range}
	 */
	_getDefaultRange() {
		const defaultRoot = this._getDefaultRoot();
		const schema = this.model.schema;

		// Find the first position where the selection can be put.
		const position = new Position( defaultRoot, [ 0 ] );
		const nearestRange = schema.getNearestSelectionRange( position );

		// If valid selection range is not found - return range collapsed at the beginning of the root.
		return nearestRange || new Range( position );
	}

	/**
	 * Checks whether a given {@link module:engine/model/range~Range range} is a valid range for
	 * the {@link #selection document's selection}.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range A range to check.
	 * @returns {Boolean} `true` if `range` is valid, `false` otherwise.
	 */
	_validateSelectionRange( range ) {
		return validateTextNodePosition( range.start ) && validateTextNodePosition( range.end );
	}

	/**
	 * Performs post-fixer loops. Executes post-fixer callbacks as long as none of them has done any changes to the model.
	 *
	 * @private
	 */
	_callPostFixers( writer ) {
		let wasFixed = false;

		do {
			for ( const callback of this._postFixers ) {
				wasFixed = callback( writer );

				if ( wasFixed ) {
					break;
				}
			}
		} while ( wasFixed );
	}

	/**
	 * Fired after an {@link module:engine/model/model~Model#enqueueChange enqueue change block} or the outermost
	 * {@link module:engine/model/model~Model#change change block} was executed and the document model tree was changed
	 * during that block execution.
	 *
	 * @event change
	 * @param {module:engine/model/batch~Batch} batch The batch that was used in the executed changes block.
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
