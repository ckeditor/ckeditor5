/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/document
 */

import Differ from './differ.js';
import DocumentSelection from './documentselection.js';
import History from './history.js';
import RootElement from './rootelement.js';

import type { SelectionChangeEvent } from './selection.js';
import type { default as Model, ModelApplyOperationEvent } from './model.js';
import type { MarkerCollectionUpdateEvent, MarkerChangeEvent } from './markercollection.js';
import type Batch from './batch.js';
import type Position from './position.js';
import type Range from './range.js';
import type Writer from './writer.js';

import {
	CKEditorError,
	Collection,
	EmitterMixin,
	isInsideSurrogatePair,
	isInsideCombinedSymbol
} from '@ckeditor/ckeditor5-utils';

import { clone } from 'es-toolkit/compat';

// @if CK_DEBUG_ENGINE // const { logDocument } = require( '../dev-utils/utils' );

const graveyardName = '$graveyard';

/**
 * Data model's document. It contains the model's structure, its selection and the history of changes.
 *
 * Read more about working with the model in
 * {@glink framework/architecture/editing-engine#model introduction to the the editing engine's architecture}.
 *
 * Usually, the document contains just one {@link module:engine/model/document~Document#roots root element}, so
 * you can retrieve it by just calling {@link module:engine/model/document~Document#getRoot} without specifying its name:
 *
 * ```ts
 * model.document.getRoot(); // -> returns the main root
 * ```
 *
 * However, the document may contain multiple roots – e.g. when the editor has multiple editable areas
 * (e.g. a title and a body of a message).
 */
export default class Document extends /* #__PURE__ */ EmitterMixin() {
	/**
	 * The {@link module:engine/model/model~Model model} that the document is a part of.
	 */
	public readonly model: Model;

	/**
	 * The document's history.
	 */
	public readonly history: History;

	/**
	 * The selection in this document.
	 */
	public readonly selection: DocumentSelection;

	/**
	 * A list of roots that are owned and managed by this document. Use {@link #createRoot}, {@link #getRoot} and
	 * {@link #getRootNames} to manipulate it.
	 */
	public readonly roots: Collection<RootElement>;

	/**
	 * The model differ object. Its role is to buffer changes done on the model document and then calculate a diff of those changes.
	 */
	public readonly differ: Differ;

	/**
	 * Defines whether the document is in a read-only mode.
	 *
	 * The user should not be able to change the data of a document that is read-only.
	 *
	 * @readonly
	 */
	public isReadOnly: boolean;

	/**
	 * Post-fixer callbacks registered to the model document.
	 */
	private readonly _postFixers: Set<ModelPostFixer>;

	/**
	 * A flag that indicates whether the selection has changed since last change block.
	 */
	private _hasSelectionChangedFromTheLastChangeBlock: boolean;

	/**
	 * Creates an empty document instance with no {@link #roots} (other than
	 * the {@link #graveyard graveyard root}).
	 */
	constructor( model: Model ) {
		super();

		this.model = model;
		this.history = new History();
		this.selection = new DocumentSelection( this );
		this.roots = new Collection( { idProperty: 'rootName' } );
		this.differ = new Differ( model.markers );
		this.isReadOnly = false;

		this._postFixers = new Set();
		this._hasSelectionChangedFromTheLastChangeBlock = false;

		// Graveyard tree root. Document always have a graveyard root, which stores removed nodes.
		this.createRoot( '$root', graveyardName );

		// Then, still before an operation is applied on model, buffer the change in differ.
		this.listenTo<ModelApplyOperationEvent>( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.isDocumentOperation ) {
				this.differ.bufferOperation( operation );
			}
		}, { priority: 'high' } );

		// After the operation is applied, bump document's version and add the operation to the history.
		this.listenTo<ModelApplyOperationEvent>( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.isDocumentOperation ) {
				this.history.addOperation( operation );
			}
		}, { priority: 'low' } );

		// Listen to selection changes. If selection changed, mark it.
		this.listenTo<SelectionChangeEvent>( this.selection, 'change', () => {
			this._hasSelectionChangedFromTheLastChangeBlock = true;
		} );

		// Buffer marker changes.
		// This is not covered in buffering operations because markers may change outside of them (when they
		// are modified using `model.markers` collection, not through `MarkerOperation`).
		this.listenTo<MarkerCollectionUpdateEvent>( model.markers, 'update', ( evt, marker, oldRange, newRange, oldMarkerData ) => {
			// Copy the `newRange` to the new marker data as during the marker removal the range is not updated.
			const newMarkerData = { ...marker.getData(), range: newRange };

			// Whenever marker is updated, buffer that change.
			this.differ.bufferMarkerChange( marker.name, oldMarkerData, newMarkerData );

			if ( oldRange === null ) {
				// If this is a new marker, add a listener that will buffer change whenever marker changes.
				marker.on<MarkerChangeEvent>( 'change', ( evt, oldRange ) => {
					const markerData = marker.getData();

					this.differ.bufferMarkerChange(
						marker.name,
						{ ...markerData, range: oldRange },
						markerData
					);
				} );
			}
		} );

		// This is a solution for a problem that may occur during real-time editing. If one client detached a root and another added
		// something there at the same moment, the OT does not solve this problem currently. In such situation, the added elements would
		// stay in the detached root.
		//
		// This is incorrect, a detached root should be empty and all elements from it should be removed. To solve this, the post-fixer will
		// remove any element that is left in a detached root.
		//
		// Similarly, markers that are created at the beginning or at the end of the detached root will not be removed as well.
		//
		// The drawback of this solution over the OT solution is that the elements removed by the post-fixer will never be brought back.
		// If the root detachment gets undone (and the root is brought back), the removed elements will not be there.
		this.registerPostFixer( writer => {
			let result = false;

			for ( const root of this.roots ) {
				if ( !root.isAttached() && !root.isEmpty ) {
					writer.remove( writer.createRangeIn( root ) );

					result = true;
				}
			}

			for ( const marker of this.model.markers ) {
				if ( !marker.getRange().root.isAttached() ) {
					writer.removeMarker( marker );

					result = true;
				}
			}

			return result;
		} );
	}

	/**
	 * The document version. Every applied operation increases the version number. It is used to
	 * ensure that operations are applied on a proper document version.
	 *
	 * This property is equal to {@link module:engine/model/history~History#version `model.Document#history#version`}.
	 *
	 * If the {@link module:engine/model/operation/operation~Operation#baseVersion base version} does not match the document version,
	 * a {@link module:utils/ckeditorerror~CKEditorError model-document-applyoperation-wrong-version} error is thrown.
	 */
	public get version(): number {
		return this.history.version;
	}

	public set version( version: number ) {
		this.history.version = version;
	}

	/**
	 * The graveyard tree root. A document always has a graveyard root that stores removed nodes.
	 */
	public get graveyard(): RootElement {
		return this.getRoot( graveyardName )!;
	}

	/**
	 * Creates a new root.
	 *
	 * **Note:** do not use this method after the editor has been initialized! If you want to dynamically add a root, use
	 * {@link module:engine/model/writer~Writer#addRoot `model.Writer#addRoot`} instead.
	 *
	 * @param elementName The element name. Defaults to `'$root'` which also has some basic schema defined
	 * (e.g. `$block` elements are allowed inside the `$root`). Make sure to define a proper schema if you use a different name.
	 * @param rootName A unique root name.
	 * @returns The created root.
	 */
	public createRoot( elementName: string = '$root', rootName: string = 'main' ): RootElement {
		if ( this.roots.get( rootName ) ) {
			/**
			 * A root with the specified name already exists.
			 *
			 * @error model-document-createroot-name-exists
			 */
			throw new CKEditorError( 'model-document-createroot-name-exists', this, { name: rootName } );
		}

		const root = new RootElement( this, elementName, rootName );
		this.roots.add( root );

		return root;
	}

	/**
	 * Removes all event listeners set by the document instance.
	 */
	public destroy(): void {
		this.selection.destroy();
		this.stopListening();
	}

	/**
	 * Returns a root by its name.
	 *
	 * Detached roots are returned by this method. This is to be able to operate on the detached root (for example, to be able to create
	 * a position inside such a root for undo feature purposes).
	 *
	 * @param name The root name of the root to return.
	 * @returns The root registered under a given name or `null` when there is no root with the given name.
	 */
	public getRoot( name: string = 'main' ): RootElement | null {
		return this.roots.get( name );
	}

	/**
	 * Returns an array with names of all roots added to the document (except the {@link #graveyard graveyard root}).
	 *
	 * Detached roots **are not** returned by this method by default. This is to make sure that all features or algorithms that operate
	 * on the document data know which roots are still a part of the document and should be processed.
	 *
	 * @param includeDetached Specified whether detached roots should be returned as well.
	 */
	public getRootNames( includeDetached = false ): Array<string> {
		return this.getRoots( includeDetached ).map( root => root.rootName );
	}

	/**
	 * Returns an array with all roots added to the document (except the {@link #graveyard graveyard root}).
	 *
	 * Detached roots **are not** returned by this method by default. This is to make sure that all features or algorithms that operate
	 * on the document data know which roots are still a part of the document and should be processed.
	 *
	 * @param includeDetached Specified whether detached roots should be returned as well.
	 */
	public getRoots( includeDetached = false ): Array<RootElement> {
		return this.roots.filter( root => root != this.graveyard && ( includeDetached || root.isAttached() ) && root._isLoaded );
	}

	/**
	 * Used to register a post-fixer callback. A post-fixer mechanism guarantees that the features
	 * will operate on a correct model state.
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
	 * ```ts
	 * document.registerPostFixer( writer => {
	 * 	const changes = document.differ.getChanges();
	 *
	 * 	// Check if the changes lead to an empty root in the editor.
	 * 	for ( const entry of changes ) {
	 * 		if ( entry.type == 'remove' && entry.position.root.isEmpty ) {
	 * 			writer.insertElement( 'paragraph', entry.position.root, 0 );
	 *
	 * 			// It is fine to return early, even if multiple roots would need to be fixed.
	 * 			// All post-fixers will be fired again, so if there are more empty roots, those will be fixed, too.
	 * 			return true;
	 * 		}
	 * 	}
	 *
	 * 	return false;
	 * } );
	 * ```
	 */
	public registerPostFixer( postFixer: ModelPostFixer ): void {
		this._postFixers.add( postFixer );
	}

	/**
	 * A custom `toJSON()` method to solve child-parent circular dependencies.
	 *
	 * @returns A clone of this object with the document property changed to a string.
	 */
	public toJSON(): unknown {
		const json: any = clone( this );

		// Due to circular references we need to remove parent reference.
		json.selection = '[engine.model.DocumentSelection]';
		json.model = '[engine.model.Model]';

		return json;
	}

	/**
	 * Check if there were any changes done on document, and if so, call post-fixers,
	 * fire `change` event for features and conversion and then reset the differ.
	 * Fire `change:data` event when at least one operation or buffered marker changes the data.
	 *
	 * @internal
	 * @fires change
	 * @fires change:data
	 * @param writer The writer on which post-fixers will be called.
	 */
	public _handleChangeBlock( writer: Writer ): void {
		if ( this._hasDocumentChangedFromTheLastChangeBlock() ) {
			this._callPostFixers( writer );

			// Refresh selection attributes according to the final position in the model after the change.
			this.selection.refresh();

			if ( this.differ.hasDataChanges() ) {
				this.fire<DocumentChangeEvent>( 'change:data', writer.batch );
			} else {
				this.fire<DocumentChangeEvent>( 'change', writer.batch );
			}

			// Theoretically, it is not necessary to refresh selection after change event because
			// post-fixers are the last who should change the model, but just in case...
			this.selection.refresh();

			this.differ.reset();
		}

		this._hasSelectionChangedFromTheLastChangeBlock = false;
	}

	/**
	 * Returns whether there is a buffered change or if the selection has changed from the last
	 * {@link module:engine/model/model~Model#enqueueChange `enqueueChange()` block}
	 * or {@link module:engine/model/model~Model#change `change()` block}.
	 *
	 * @returns Returns `true` if document has changed from the last `change()` or `enqueueChange()` block.
	 */
	protected _hasDocumentChangedFromTheLastChangeBlock(): boolean {
		return !this.differ.isEmpty || this._hasSelectionChangedFromTheLastChangeBlock;
	}

	/**
	 * Returns the default root for this document which is either the first root that was added to the document using
	 * {@link #createRoot} or the {@link #graveyard graveyard root} if no other roots were created.
	 *
	 * @returns The default root for this document.
	 */
	protected _getDefaultRoot(): RootElement {
		const roots = this.getRoots();

		return roots.length ? roots[ 0 ] : this.graveyard;
	}

	/**
	 * Returns the default range for this selection. The default range is a collapsed range that starts and ends
	 * at the beginning of this selection's document {@link #_getDefaultRoot default root}.
	 *
	 * @internal
	 */
	public _getDefaultRange(): Range {
		const defaultRoot = this._getDefaultRoot();
		const model = this.model;
		const schema = model.schema;

		// Find the first position where the selection can be put.
		const position = model.createPositionFromPath( defaultRoot, [ 0 ] );
		const nearestRange = schema.getNearestSelectionRange( position );

		// If valid selection range is not found - return range collapsed at the beginning of the root.
		return nearestRange || model.createRange( position );
	}

	/**
	 * Checks whether a given {@link module:engine/model/range~Range range} is a valid range for
	 * the {@link #selection document's selection}.
	 *
	 * @internal
	 * @param range A range to check.
	 * @returns `true` if `range` is valid, `false` otherwise.
	 */
	public _validateSelectionRange( range: Range ): boolean {
		return range.start.isValid() && range.end.isValid() &&
			validateTextNodePosition( range.start ) && validateTextNodePosition( range.end );
	}

	/**
	 * Performs post-fixer loops. Executes post-fixer callbacks as long as none of them has done any changes to the model.
	 *
	 * @param writer The writer on which post-fixer callbacks will be called.
	 */
	private _callPostFixers( writer: Writer ) {
		let wasFixed = false;

		do {
			for ( const callback of this._postFixers ) {
				// Ensure selection attributes are up to date before each post-fixer.
				// https://github.com/ckeditor/ckeditor5-engine/issues/1673.
				//
				// It might be good to refresh the selection after each operation but at the moment it leads
				// to losing attributes for composition or and spell checking
				// https://github.com/ckeditor/ckeditor5-typing/issues/188
				this.selection.refresh();

				wasFixed = callback( writer );

				if ( wasFixed ) {
					break;
				}
			}
		} while ( wasFixed );
	}

	// @if CK_DEBUG_ENGINE // public log( version: any = null ): void {
	// @if CK_DEBUG_ENGINE // 	version = version === null ? this.version : version;
	// @if CK_DEBUG_ENGINE // 	logDocument( this, version );
	// @if CK_DEBUG_ENGINE // }
}

/**
 * Fired after each {@link module:engine/model/model~Model#enqueueChange `enqueueChange()` block} or the outermost
 * {@link module:engine/model/model~Model#change `change()` block} was executed and the document was changed
 * during that block's execution.
 *
 * The changes which this event will cover include:
 *
 * * document structure changes,
 * * selection changes,
 * * marker changes.
 *
 * If you want to be notified about all these changes, then simply listen to this event like this:
 *
 * ```ts
 * model.document.on( 'change', () => {
 * 	console.log( 'The document has changed!' );
 * } );
 * ```
 *
 * If, however, you only want to be notified about the data changes, then use `change:data` event,
 * which is fired for document structure changes and marker changes (which affects the data).
 *
 * ```ts
 * model.document.on( 'change:data', () => {
 * 	console.log( 'The data has changed!' );
 * } );
 * ```
 *
 * @eventName ~Document#change
 * @eventName ~Document#change:data
 * @param batch The batch that was used in the executed changes block.
 */
export type DocumentChangeEvent = {
	name: 'change' | 'change:data';
	args: [ batch: Batch ];
};

/**
 * Callback passed as an argument to the {@link module:engine/model/document~Document#registerPostFixer} method.
 */
export type ModelPostFixer = ( writer: Writer ) => boolean;

/**
 * Checks whether given range boundary position is valid for document selection, meaning that is not between
 * unicode surrogate pairs or base character and combining marks.
 */
function validateTextNodePosition( rangeBoundary: Position ) {
	const textNode = rangeBoundary.textNode;

	if ( textNode ) {
		const data = textNode.data;
		const offset = rangeBoundary.offset - textNode.startOffset!;

		return !isInsideSurrogatePair( data, offset ) && !isInsideCombinedSymbol( data, offset );
	}

	return true;
}
