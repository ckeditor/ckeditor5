/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/model
 */

import Batch, { type BatchType } from './batch';
import Document from './document';
import MarkerCollection from './markercollection';
import ModelPosition, { type PositionOffset, type PositionStickiness } from './position';
import ModelRange from './range';
import ModelSelection, { type PlaceOrOffset, type Selectable } from './selection';
import OperationFactory from './operation/operationfactory';
import Schema from './schema';
import Writer from './writer';

import { autoParagraphEmptyRoots } from './utils/autoparagraphing';
import { injectSelectionPostFixer } from './utils/selection-post-fixer';
import deleteContent from './utils/deletecontent';
import getSelectedContent from './utils/getselectedcontent';
import insertContent from './utils/insertcontent';
import insertObject from './utils/insertobject';
import modifySelection from './utils/modifyselection';

import type ModelDocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type Item from './item';
import type ModelElement from './element';
import type Operation from './operation/operation';

import {
	CKEditorError,
	ObservableMixin,
	type DecoratedMethodEvent
} from '@ckeditor/ckeditor5-utils';

// @if CK_DEBUG_ENGINE // const { dumpTrees } = require( '../dev-utils/utils' );
// @if CK_DEBUG_ENGINE // const { OperationReplayer } = require( '../dev-utils/operationreplayer' ).default;

/**
 * Editor's data model. Read about the model in the
 * {@glink framework/architecture/editing-engine engine architecture} guide.
 */
export default class Model extends ObservableMixin() {
	/**
	 * Model's marker collection.
	 */
	public readonly markers: MarkerCollection;

	/**
	 * Model's document.
	 */
	public readonly document: Document;

	/**
	 * Model's schema.
	 */
	public readonly schema: Schema;

	/**
	 * All callbacks added by {@link module:engine/model/model~Model#change} or
	 * {@link module:engine/model/model~Model#enqueueChange} methods waiting to be executed.
	 */
	private readonly _pendingChanges: Array<{ batch: Batch; callback: ( writer: Writer ) => any }>;

	/**
	 * The last created and currently used writer instance.
	 */
	private _currentWriter: Writer | null;

	constructor() {
		super();

		this.markers = new MarkerCollection();
		this.document = new Document( this );
		this.schema = new Schema();

		this._pendingChanges = [];
		this._currentWriter = null;

		( [ 'insertContent', 'insertObject', 'deleteContent', 'modifySelection', 'getSelectedContent', 'applyOperation' ] as const )
			.forEach( methodName => this.decorate( methodName ) );

		// Adding operation validation with `highest` priority, so it is called before any other feature would like
		// to do anything with the operation. If the operation has incorrect parameters it should throw on the earliest occasion.
		this.on<ModelApplyOperationEvent>( 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			operation._validate();
		}, { priority: 'highest' } );

		// Register some default abstract entities.
		this.schema.register( '$root', {
			isLimit: true
		} );

		this.schema.register( '$container', {
			allowIn: [ '$root', '$container' ]
		} );

		this.schema.register( '$block', {
			allowIn: [ '$root', '$container' ],
			isBlock: true
		} );

		this.schema.register( '$blockObject', {
			allowWhere: '$block',
			isBlock: true,
			isObject: true
		} );

		this.schema.register( '$inlineObject', {
			allowWhere: '$text',
			allowAttributesOf: '$text',
			isInline: true,
			isObject: true
		} );

		this.schema.register( '$text', {
			allowIn: '$block',
			isInline: true,
			isContent: true
		} );

		this.schema.register( '$clipboardHolder', {
			allowContentOf: '$root',
			allowChildren: '$text',
			isLimit: true
		} );

		this.schema.register( '$documentFragment', {
			allowContentOf: '$root',
			allowChildren: '$text',
			isLimit: true
		} );

		// An element needed by the `upcastElementToMarker` converter.
		// This element temporarily represents a marker boundary during the conversion process and is removed
		// at the end of the conversion. `UpcastDispatcher` or at least `Conversion` class looks like a
		// better place for this registration but both know nothing about `Schema`.
		this.schema.register( '$marker' );
		this.schema.addChildCheck( ( context, childDefinition ) => {
			if ( childDefinition.name === '$marker' ) {
				return true;
			}
		} );

		injectSelectionPostFixer( this );

		// Post-fixer which takes care of adding empty paragraph elements to the empty roots.
		this.document.registerPostFixer( autoParagraphEmptyRoots );

		// @if CK_DEBUG_ENGINE // this.on( 'applyOperation', () => {
		// @if CK_DEBUG_ENGINE // 	dumpTrees( this.document, this.document.version );
		// @if CK_DEBUG_ENGINE // }, { priority: 'lowest' } );
	}

	/**
	 * The `change()` method is the primary way of changing the model. You should use it to modify all document nodes
	 * (including detached nodes – i.e. nodes not added to the {@link module:engine/model/model~Model#document model document}),
	 * the {@link module:engine/model/document~Document#selection document's selection}, and
	 * {@link module:engine/model/model~Model#markers model markers}.
	 *
	 * ```ts
	 * model.change( writer => {
	 * 	writer.insertText( 'foo', paragraph, 'end' );
	 * } );
	 * ```
	 *
	 * All changes inside the change block use the same {@link module:engine/model/batch~Batch} so they are combined
	 * into a single undo step.
	 *
	 * ```ts
	 * model.change( writer => {
	 * 	writer.insertText( 'foo', paragraph, 'end' ); // foo.
	 *
	 * 	model.change( writer => {
	 * 		writer.insertText( 'bar', paragraph, 'end' ); // foobar.
	 * 	} );
	 *
	 * 	writer.insertText( 'bom', paragraph, 'end' ); // foobarbom.
	 * } );
	 * ```
	 *
	 * The callback of the `change()` block is executed synchronously.
	 *
	 * You can also return a value from the change block.
	 *
	 * ```ts
	 * const img = model.change( writer => {
	 * 	return writer.createElement( 'img' );
	 * } );
	 * ```
	 *
	 * @see #enqueueChange
	 * @typeParam TReturn The return type of the provided callback.
	 * @param callback Callback function which may modify the model.
	 */
	public change<TReturn>( callback: ( writer: Writer ) => TReturn ): TReturn {
		try {
			if ( this._pendingChanges.length === 0 ) {
				// If this is the outermost block, create a new batch and start `_runPendingChanges` execution flow.
				this._pendingChanges.push( { batch: new Batch(), callback } );

				return this._runPendingChanges()[ 0 ];
			} else {
				// If this is not the outermost block, just execute the callback.
				return callback( this._currentWriter! );
			}
		} catch ( err: any ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	}

	/**
	 * The `enqueueChange()` method performs similar task as the {@link #change `change()` method}, with two major differences.
	 *
	 * First, the callback of `enqueueChange()` is executed when all other enqueued changes are done. It might be executed
	 * immediately if it is not nested in any other change block, but if it is nested in another (enqueue)change block,
	 * it will be delayed and executed after the outermost block.
	 *
	 * ```ts
	 * model.change( writer => {
	 * 	console.log( 1 );
	 *
	 * 	model.enqueueChange( writer => {
	 * 		console.log( 2 );
	 * 	} );
	 *
	 * 	console.log( 3 );
	 * } ); // Will log: 1, 3, 2.
	 * ```
	 *
	 * In addition to that, the changes enqueued with `enqueueChange()` will be converted separately from the changes
	 * done in the outer `change()` block.
	 *
	 * By default, a new batch with the default {@link module:engine/model/batch~Batch#constructor batch type} is created.
	 * To define the {@link module:engine/model/batch~Batch} into which you want to add your changes,
	 * use {@link #enqueueChange#CUSTOM_BATCH}.
	 *
	 * @label DEFAULT_BATCH
	 * If not defined, a new batch with the default type will be created.
	 * @param callback Callback function which may modify the model.
	 */
	public enqueueChange(
		callback: ( writer: Writer ) => unknown
	): void;

	/**
	 * The `enqueueChange()` method performs similar task as the {@link #change `change()` method}, with two major differences.
	 *
	 * First, the callback of `enqueueChange()` is executed when all other enqueued changes are done. It might be executed
	 * immediately if it is not nested in any other change block, but if it is nested in another (enqueue)change block,
	 * it will be delayed and executed after the outermost block.
	 *
	 * ```ts
	 * model.change( new Batch(), writer => {
	 * 	console.log( 1 );
	 *
	 * 	model.enqueueChange( new Batch(), writer => {
	 * 		console.log( 2 );
	 * 	} );
	 *
	 * 	console.log( 3 );
	 * } ); // Will log: 1, 3, 2.
	 * ```
	 *
	 * In addition to that, the changes enqueued with `enqueueChange()` will be converted separately from the changes
	 * done in the outer `change()` block.
	 *
	 * Second, it lets you define the {@link module:engine/model/batch~Batch} into which you want to add your changes.
	 * If you want to use default {@link module:engine/model/batch~Batch#constructor batch type}, use {@link #enqueueChange#DEFAULT_BATCH}.
	 *
	 * ```ts
	 * model.enqueueChange( { isUndoable: false }, writer => {
	 * 	writer.insertText( 'foo', paragraph, 'end' );
	 * } );
	 * ```
	 *
	 * When using the `enqueueChange()` block you can also add some changes to the batch you used before.
	 *
	 * ```ts
	 * model.enqueueChange( batch, writer => {
	 * 	writer.insertText( 'foo', paragraph, 'end' );
	 * } );
	 * ```
	 *
	 * In order to make a nested `enqueueChange()` create a single undo step together with the changes done in the outer `change()`
	 * block, you can obtain the batch instance from the  {@link module:engine/model/writer~Writer#batch writer} of the outer block.
	 *
	 * @label CUSTOM_BATCH
	 * @param batchOrType A batch or a {@link module:engine/model/batch~Batch#constructor batch type} that should be used in the callback.
	 * If not defined, a new batch with the default type will be created.
	 * @param callback Callback function which may modify the model.
	 */
	public enqueueChange(
		batchOrType: Batch | BatchType | undefined,
		callback: ( writer: Writer ) => unknown
	): void;

	public enqueueChange(
		batchOrType: Batch | BatchType | ( ( writer: Writer ) => unknown ) | undefined,
		callback?: ( writer: Writer ) => unknown
	): void {
		try {
			if ( !batchOrType ) {
				batchOrType = new Batch();
			} else if ( typeof batchOrType === 'function' ) {
				callback = batchOrType;
				batchOrType = new Batch();
			} else if ( !( batchOrType instanceof Batch ) ) {
				batchOrType = new Batch( batchOrType );
			}

			this._pendingChanges.push( { batch: batchOrType, callback } as any );

			if ( this._pendingChanges.length == 1 ) {
				this._runPendingChanges();
			}
		} catch ( err: any ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	}

	/**
	 * {@link module:utils/observablemixin~Observable#decorate Decorated} function for applying
	 * {@link module:engine/model/operation/operation~Operation operations} to the model.
	 *
	 * This is a low-level way of changing the model. It is exposed for very specific use cases (like the undo feature).
	 * Normally, to modify the model, you will want to use {@link module:engine/model/writer~Writer `Writer`}.
	 * See also {@glink framework/architecture/editing-engine#changing-the-model Changing the model} section
	 * of the {@glink framework/architecture/editing-engine Editing architecture} guide.
	 *
	 * @param operation The operation to apply.
	 */
	public applyOperation( operation: Operation ): void {
		// @if CK_DEBUG_ENGINE // console.log( 'Applying ' + operation );

		// @if CK_DEBUG_ENGINE // if ( !this._operationLogs ) {
		// @if CK_DEBUG_ENGINE //	this._operationLogs = [];
		// @if CK_DEBUG_ENGINE // }

		// @if CK_DEBUG_ENGINE // this._operationLogs.push( JSON.stringify( operation ) );

		// @if CK_DEBUG_ENGINE //if ( !this._appliedOperations ) {
		// @if CK_DEBUG_ENGINE //	this._appliedOperations = [];
		// @if CK_DEBUG_ENGINE //}

		// @if CK_DEBUG_ENGINE //this._appliedOperations.push( operation );

		operation._execute();
	}

	// @if CK_DEBUG_ENGINE // getAppliedOperation() {
	// @if CK_DEBUG_ENGINE //	if ( !this._appliedOperations ) {
	// @if CK_DEBUG_ENGINE //		return '';
	// @if CK_DEBUG_ENGINE //	}

	// @if CK_DEBUG_ENGINE //	return this._appliedOperations.map( JSON.stringify ).join( '-------' );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // createReplayer( stringifiedOperations ) {
	// @if CK_DEBUG_ENGINE //	return new OperationReplayer( this, '-------', stringifiedOperations );
	// @if CK_DEBUG_ENGINE // }

	/**
	 * Inserts content at the position in the editor specified by the selection, as one would expect the paste
	 * functionality to work.
	 *
	 * **Note**: If you want to insert an {@glink framework/deep-dive/schema#object-elements object element}
	 * (e.g. a {@link module:widget/utils~toWidget widget}), see {@link #insertObject} instead.
	 *
	 * This is a high-level method. It takes the {@link #schema schema} into consideration when inserting
	 * the content, clears the given selection's content before inserting nodes and moves the selection
	 * to its target position at the end of the process.
	 * It can split elements, merge them, wrap bare text nodes with paragraphs, etc. &mdash; just like the
	 * pasting feature should do.
	 *
	 * For lower-level methods see {@link module:engine/model/writer~Writer `Writer`}.
	 *
	 * This method, unlike {@link module:engine/model/writer~Writer `Writer`}'s methods, does not have to be used
	 * inside a {@link #change `change()` block}.
	 *
	 * # Conversion and schema
	 *
	 * Inserting elements and text nodes into the model is not enough to make CKEditor 5 render that content
	 * to the user. CKEditor 5 implements a model-view-controller architecture and what `model.insertContent()` does
	 * is only adding nodes to the model. Additionally, you need to define
	 * {@glink framework/architecture/editing-engine#conversion converters} between the model and view
	 * and define those nodes in the {@glink framework/architecture/editing-engine#schema schema}.
	 *
	 * So, while this method may seem similar to CKEditor 4 `editor.insertHtml()` (in fact, both methods
	 * are used for paste-like content insertion), the CKEditor 5 method cannot be use to insert arbitrary HTML
	 * unless converters are defined for all elements and attributes in that HTML.
	 *
	 * # Examples
	 *
	 * Using `insertContent()` with a manually created model structure:
	 *
	 * ```ts
	 * // Let's create a document fragment containing such content as:
	 * //
	 * // <paragraph>foo</paragraph>
	 * // <blockQuote>
	 * //    <paragraph>bar</paragraph>
	 * // </blockQuote>
	 * const docFrag = editor.model.change( writer => {
	 * 	const p1 = writer.createElement( 'paragraph' );
	 * 	const p2 = writer.createElement( 'paragraph' );
	 * 	const blockQuote = writer.createElement( 'blockQuote' );
	 * 	const docFrag = writer.createDocumentFragment();
	 *
	 * 	writer.append( p1, docFrag );
	 * 	writer.append( blockQuote, docFrag );
	 * 	writer.append( p2, blockQuote );
	 * 	writer.insertText( 'foo', p1 );
	 * 	writer.insertText( 'bar', p2 );
	 *
	 * 	return docFrag;
	 * } );
	 *
	 * // insertContent() does not have to be used in a change() block. It can, though,
	 * // so this code could be moved to the callback defined above.
	 * editor.model.insertContent( docFrag );
	 * ```
	 *
	 * Using `insertContent()` with an HTML string converted to a model document fragment (similar to the pasting mechanism):
	 *
	 * ```ts
	 * // You can create your own HtmlDataProcessor instance or use editor.data.processor
	 * // if you have not overridden the default one (which is the HtmlDataProcessor instance).
	 * const htmlDP = new HtmlDataProcessor( viewDocument );
	 *
	 * // Convert an HTML string to a view document fragment:
	 * const viewFragment = htmlDP.toView( htmlString );
	 *
	 * // Convert the view document fragment to a model document fragment
	 * // in the context of $root. This conversion takes the schema into
	 * // account so if, for example, the view document fragment contained a bare text node,
	 * // this text node cannot be a child of $root, so it will be automatically
	 * // wrapped with a <paragraph>. You can define the context yourself (in the second parameter),
	 * // and e.g. convert the content like it would happen in a <paragraph>.
	 * // Note: The clipboard feature uses a custom context called $clipboardHolder
	 * // which has a loosened schema.
	 * const modelFragment = editor.data.toModel( viewFragment );
	 *
	 * editor.model.insertContent( modelFragment );
	 * ```
	 *
	 * By default this method will use the document selection but it can also be used with a position, range or selection instance.
	 *
	 * ```ts
	 * // Insert text at the current document selection position.
	 * editor.model.change( writer => {
	 * 	editor.model.insertContent( writer.createText( 'x' ) );
	 * } );
	 *
	 * // Insert text at a given position - the document selection will not be modified.
	 * editor.model.change( writer => {
	 * 	editor.model.insertContent( writer.createText( 'x' ), doc.getRoot(), 2 );
	 *
	 * 	// Which is a shorthand for:
	 * 	editor.model.insertContent( writer.createText( 'x' ), writer.createPositionAt( doc.getRoot(), 2 ) );
	 * } );
	 * ```
	 *
	 * If you want the document selection to be moved to the inserted content, use the
	 * {@link module:engine/model/writer~Writer#setSelection `setSelection()`} method of the writer after inserting
	 * the content:
	 *
	 * ```ts
	 * editor.model.change( writer => {
	 * 	const paragraph = writer.createElement( 'paragraph' );
	 *
	 * 	// Insert an empty paragraph at the beginning of the root.
	 * 	editor.model.insertContent( paragraph, writer.createPositionAt( editor.model.document.getRoot(), 0 ) );
	 *
	 * 	// Move the document selection to the inserted paragraph.
	 * 	writer.setSelection( paragraph, 'in' );
	 * } );
	 * ```
	 *
	 * If an instance of the {@link module:engine/model/selection~Selection model selection} is passed as `selectable`,
	 * the new content will be inserted at the passed selection (instead of document selection):
	 *
	 * ```ts
	 * editor.model.change( writer => {
	 * 	// Create a selection in a paragraph that will be used as a place of insertion.
	 * 	const selection = writer.createSelection( paragraph, 'in' );
	 *
	 * 	// Insert the new text at the created selection.
	 * 	editor.model.insertContent( writer.createText( 'x' ), selection );
	 *
	 * 	// insertContent() modifies the passed selection instance so it can be used to set the document selection.
	 * 	// Note: This is not necessary when you passed the document selection to insertContent().
	 * 	writer.setSelection( selection );
	 * } );
	 * ```
	 *
	 * @fires insertContent
	 * @param content The content to insert.
	 * @param selectable The selection into which the content should be inserted.
	 * If not provided the current model document selection will be used.
	 * @param placeOrOffset To be used when a model item was passed as `selectable`.
	 * This param defines a position in relation to that item.
	 * at the insertion position.
	 */
	public insertContent(
		content: Item | ModelDocumentFragment,
		selectable?: Selectable,
		placeOrOffset?: PlaceOrOffset
	): ModelRange {
		return insertContent( this, content, selectable, placeOrOffset );
	}

	/**
	 * Inserts an {@glink framework/deep-dive/schema#object-elements object element} at a specific position in the editor content.
	 *
	 * This is a high-level API:
	 * * It takes the {@link #schema schema} into consideration,
	 * * It clears the content of passed `selectable` before inserting,
	 * * It can move the selection at the end of the process,
	 * * It will copy the selected block's attributes to preserve them upon insertion,
	 * * It can split elements or wrap inline objects with paragraphs if they are not allowed in target position,
	 * * etc.
	 *
	 * # Notes
	 *
	 * * If you want to insert a non-object content, see {@link #insertContent} instead.
	 * * For lower-level API, see {@link module:engine/model/writer~Writer `Writer`}.
	 * * Unlike {@link module:engine/model/writer~Writer `Writer`}, this method does not have to be used inside
	 * a {@link #change `change()` block}.
	 * * Inserting object into the model is not enough to make CKEditor 5 render that content to the user.
	 * CKEditor 5 implements a model-view-controller architecture and what `model.insertObject()` does
	 * is only adding nodes to the model. Additionally, you need to define
	 * {@glink framework/architecture/editing-engine#conversion converters} between the model and view
	 * and define those nodes in the {@glink framework/architecture/editing-engine#schema schema}.
	 *
	 * # Examples
	 *
	 * Use the following code to insert an object at the current selection and keep the selection on the inserted element:
	 *
	 * ```ts
	 * const rawHtmlEmbedElement = writer.createElement( 'rawHtml' );
	 *
	 * model.insertObject( rawHtmlEmbedElement, null, null, {
	 * 	setSelection: 'on'
	 * } );
	 * ```
	 *
	 * Use the following code to insert an object at the current selection and nudge the selection after the inserted object:
	 *
	 * ```ts
	 * const pageBreakElement = writer.createElement( 'pageBreak' );
 	 *
	 * model.insertObject( pageBreakElement, null, null, {
	 * 	setSelection: 'after'
	 * } );
	 * ```
	 *
	 * Use the following code to insert an object at the current selection and avoid splitting the content (non-destructive insertion):
	 *
	 * ```ts
	 * const tableElement = writer.createElement( 'table' );
 	 *
	 * model.insertObject( tableElement, null, null, {
	 * 	findOptimalPosition: 'auto'
	 * } );
	 * ```
	 *
	 * Use the following code to insert an object at the specific range (also: replace the content of the range):
	 *
	 * ```ts
	 * const tableElement = writer.createElement( 'table' );
	 * const range = model.createRangeOn( model.document.getRoot().getChild( 1 ) );
 	 *
	 * model.insertObject( tableElement, range );
	 * ```
	 *
	 * @param object An object to be inserted into the model document.
	 * @param selectable A selectable where the content should be inserted. If not specified, the current
	 * {@link module:engine/model/document~Document#selection document selection} will be used instead.
	 * @param placeOrOffset Specifies the exact place or offset for the insertion to take place, relative to `selectable`.
	 * @param options Additional options.
	 * @param options.findOptimalPosition An option that, when set, adjusts the insertion position (relative to
	 * `selectable` and `placeOrOffset`) so that the content of `selectable` is not split upon insertion (a.k.a. non-destructive insertion).
	 * * When `'auto'`, the algorithm will decide whether to insert the object before or after `selectable` to avoid content splitting.
	 * * When `'before'`, the closest position before `selectable` will be used that will not result in content splitting.
	 * * When `'after'`, the closest position after `selectable` will be used that will not result in content splitting.
	 *
	 * Note that this option only works for block objects. Inline objects are inserted into text and do not split blocks.
	 * @param options.setSelection An option that, when set, moves the
	 * {@link module:engine/model/document~Document#selection document selection} after inserting the object.
	 * * When `'on'`, the document selection will be set on the inserted object.
	 * * When `'after'`, the document selection will move to the closest text node after the inserted object. If there is no
	 * such text node, a paragraph will be created and the document selection will be moved inside it.
	 * at the insertion position.
	 */
	public insertObject(
		object: ModelElement,
		selectable?: Selectable,
		placeOrOffset?: PlaceOrOffset | null,
		options?: {
			findOptimalPosition?: 'auto' | 'before' | 'after';
			setSelection?: 'on' | 'after';
		}
	): ModelRange {
		return insertObject( this, object, selectable, placeOrOffset, options );
	}

	/**
	 * Deletes content of the selection and merge siblings. The resulting selection is always collapsed.
	 *
	 * **Note:** For the sake of predictability, the resulting selection should always be collapsed.
	 * In cases where a feature wants to modify deleting behavior so selection isn't collapsed
	 * (e.g. a table feature may want to keep row selection after pressing <kbd>Backspace</kbd>),
	 * then that behavior should be implemented in the view's listener. At the same time, the table feature
	 * will need to modify this method's behavior too, e.g. to "delete contents and then collapse
	 * the selection inside the last selected cell" or "delete the row and collapse selection somewhere near".
	 * That needs to be done in order to ensure that other features which use `deleteContent()` will work well with tables.
	 *
	 * @fires deleteContent
	 * @param selection Selection of which the content should be deleted.
	 * @param options.leaveUnmerged Whether to merge elements after removing the content of the selection.
	 *
	 * For example `<heading1>x[x</heading1><paragraph>y]y</paragraph>` will become:
	 *
	 * * `<heading1>x^y</heading1>` with the option disabled (`leaveUnmerged == false`)
	 * * `<heading1>x^</heading1><paragraph>y</paragraph>` with enabled (`leaveUnmerged == true`).
	 *
	 * Note: {@link module:engine/model/schema~Schema#isObject object} and {@link module:engine/model/schema~Schema#isLimit limit}
	 * elements will not be merged.
	 *
	 * @param options.doNotResetEntireContent Whether to skip replacing the entire content with a
	 * paragraph when the entire content was selected.
	 *
	 * For example `<heading1>[x</heading1><paragraph>y]</paragraph>` will become:
	 *
	 * * `<paragraph>^</paragraph>` with the option disabled (`doNotResetEntireContent == false`)
	 * * `<heading1>^</heading1>` with enabled (`doNotResetEntireContent == true`)
	 *
	 * @param options.doNotAutoparagraph Whether to create a paragraph if after content deletion selection is moved
	 * to a place where text cannot be inserted.
	 *
	 * For example `<paragraph>x</paragraph>[<imageBlock src="foo.jpg"></imageBlock>]` will become:
	 *
	 * * `<paragraph>x</paragraph><paragraph>[]</paragraph>` with the option disabled (`doNotAutoparagraph == false`)
	 * * `<paragraph>x[]</paragraph>` with the option enabled (`doNotAutoparagraph == true`).
	 *
	 * **Note:** if there is no valid position for the selection, the paragraph will always be created:
	 *
	 * `[<imageBlock src="foo.jpg"></imageBlock>]` -> `<paragraph>[]</paragraph>`.
	 *
	 * @param options.direction The direction in which the content is being consumed.
	 * Deleting backward corresponds to using the <kbd>Backspace</kbd> key, while deleting content forward corresponds to
	 * the <kbd>Shift</kbd>+<kbd>Backspace</kbd> keystroke.
	 */
	public deleteContent(
		selection: ModelSelection | DocumentSelection,
		options?: {
			leaveUnmerged?: boolean;
			doNotResetEntireContent?: boolean;
			doNotAutoparagraph?: boolean;
			direction?: 'forward' | 'backward';
		}
	): void {
		deleteContent( this, selection, options );
	}

	/**
	 * Modifies the selection. Currently, the supported modifications are:
	 *
	 * * Extending. The selection focus is moved in the specified `options.direction` with a step specified in `options.unit`.
	 * Possible values for `unit` are:
	 *  * `'character'` (default) - moves selection by one user-perceived character. In most cases this means moving by one
	 *  character in `String` sense. However, unicode also defines "combing marks". These are special symbols, that combines
	 *  with a symbol before it ("base character") to create one user-perceived character. For example, `q̣̇` is a normal
	 *  letter `q` with two "combining marks": upper dot (`Ux0307`) and lower dot (`Ux0323`). For most actions, i.e. extending
	 *  selection by one position, it is correct to include both "base character" and all of it's "combining marks". That is
	 *  why `'character'` value is most natural and common method of modifying selection.
	 *  * `'codePoint'` - moves selection by one unicode code point. In contrary to, `'character'` unit, this will insert
	 *  selection between "base character" and "combining mark", because "combining marks" have their own unicode code points.
	 *  However, for technical reasons, unicode code points with values above `UxFFFF` are represented in native `String` by
	 *  two characters, called "surrogate pairs". Halves of "surrogate pairs" have a meaning only when placed next to each other.
	 *  For example `𨭎` is represented in `String` by `\uD862\uDF4E`. Both `\uD862` and `\uDF4E` do not have any meaning
	 *  outside the pair (are rendered as ? when alone). Position between them would be incorrect. In this case, selection
	 *  extension will include whole "surrogate pair".
	 *  * `'word'` - moves selection by a whole word.
	 *
	 * **Note:** if you extend a forward selection in a backward direction you will in fact shrink it.
	 *
	 * @fires modifySelection
	 * @param selection The selection to modify.
	 * @param options.direction The direction in which the selection should be modified.
	 * @param options.unit The unit by which selection should be modified.
	 * @param options.treatEmojiAsSingleUnit Whether multi-characer emoji sequences should be handled as single unit.
	 */
	public modifySelection(
		selection: ModelSelection | DocumentSelection,
		options?: {
			direction?: 'forward' | 'backward';
			unit?: 'character' | 'codePoint' | 'word';
			treatEmojiAsSingleUnit?: boolean;
		}
	): void {
		modifySelection( this, selection, options );
	}

	/**
	 * Gets a clone of the selected content.
	 *
	 * For example, for the following selection:
	 *
	 * ```html
	 * <paragraph>x</paragraph>
	 * <blockQuote>
	 * 	<paragraph>y</paragraph>
	 * 	<heading1>fir[st</heading1>
	 * </blockQuote>
	 * <paragraph>se]cond</paragraph>
	 * <paragraph>z</paragraph>
	 * ```
	 *
	 * It will return a document fragment with such a content:
	 *
	 * ```html
	 * <blockQuote>
	 * 	<heading1>st</heading1>
	 * </blockQuote>
	 * <paragraph>se</paragraph>
	 * ```
	 *
	 * @fires getSelectedContent
	 * @param selection The selection of which content will be returned.
	 */
	public getSelectedContent( selection: ModelSelection | DocumentSelection ): ModelDocumentFragment {
		return getSelectedContent( this, selection );
	}

	/**
	 * Checks whether the given {@link module:engine/model/range~Range range} or
	 * {@link module:engine/model/element~Element element} has any meaningful content.
	 *
	 * Meaningful content is:
	 *
	 * * any text node (`options.ignoreWhitespaces` allows controlling whether this text node must also contain
	 * any non-whitespace characters),
	 * * or any {@link module:engine/model/schema~Schema#isContent content element},
	 * * or any {@link module:engine/model/markercollection~Marker marker} which
	 * {@link module:engine/model/markercollection~Marker#_affectsData affects data}.
	 *
	 * This means that a range containing an empty `<paragraph></paragraph>` is not considered to have a meaningful content.
	 * However, a range containing an `<imageBlock></imageBlock>` (which would normally be marked in the schema as an object element)
	 * is considered non-empty.
	 *
	 * @param rangeOrElement Range or element to check.
	 * @param options.ignoreWhitespaces Whether text node with whitespaces only should be considered empty.
	 * @param options.ignoreMarkers Whether markers should be ignored.
	 */
	public hasContent(
		rangeOrElement: ModelRange | ModelElement | ModelDocumentFragment,
		options: {
			ignoreWhitespaces?: boolean;
			ignoreMarkers?: boolean;
		} = {}
	): boolean {
		const range = rangeOrElement instanceof ModelRange ? rangeOrElement : ModelRange._createIn( rangeOrElement );

		if ( range.isCollapsed ) {
			return false;
		}

		const { ignoreWhitespaces = false, ignoreMarkers = false } = options;

		// Check if there are any markers which affects data in this given range.
		if ( !ignoreMarkers ) {
			for ( const intersectingMarker of this.markers.getMarkersIntersectingRange( range ) ) {
				if ( intersectingMarker.affectsData ) {
					return true;
				}
			}
		}

		for ( const item of range.getItems() ) {
			if ( this.schema.isContent( item ) ) {
				if ( item.is( '$textProxy' ) ) {
					if ( !ignoreWhitespaces ) {
						return true;
					} else if ( item.data.search( /\S/ ) !== -1 ) {
						return true;
					}
				} else {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Creates a position from the given root and path in that root.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createPositionFromPath `Writer#createPositionFromPath()`}.
	 *
	 * @param root Root of the position.
	 * @param path Position path. See {@link module:engine/model/position~Position#path}.
	 * @param stickiness Position stickiness. See {@link module:engine/model/position~PositionStickiness}.
	 */
	public createPositionFromPath(
		root: ModelElement | ModelDocumentFragment,
		path: ReadonlyArray<number>,
		stickiness?: PositionStickiness
	): ModelPosition {
		return new ModelPosition( root, path, stickiness );
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/model/position~Position position},
	 * * a parent element and offset in that element,
	 * * a parent element and `'end'` (the position will be set at the end of that element),
	 * * a {@link module:engine/model/item~Item model item} and `'before'` or `'after'`
	 * (the position will be set before or after the given model item).
	 *
	 * This method is a shortcut to other factory methods such as:
	 *
	 * * {@link module:engine/model/model~Model#createPositionBefore `createPositionBefore()`},
	 * * {@link module:engine/model/model~Model#createPositionAfter `createPositionAfter()`}.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createPositionAt `Writer#createPositionAt()`},
	 *
	 * @param itemOrPosition
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	public createPositionAt(
		itemOrPosition: Item | ModelPosition | ModelDocumentFragment,
		offset?: PositionOffset
	): ModelPosition {
		return ModelPosition._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after the given {@link module:engine/model/item~Item model item}.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createPositionAfter `Writer#createPositionAfter()`}.
	 *
	 * @param item Item after which the position should be placed.
	 */
	public createPositionAfter( item: Item ): ModelPosition {
		return ModelPosition._createAfter( item );
	}

	/**
	 * Creates a new position before the given {@link module:engine/model/item~Item model item}.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createPositionBefore `Writer#createPositionBefore()`}.
	 *
	 * @param item Item before which the position should be placed.
	 */
	public createPositionBefore( item: Item ): ModelPosition {
		return ModelPosition._createBefore( item );
	}

	/**
	 * Creates a range spanning from the `start` position to the `end` position.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createRange `Writer#createRange()`}:
	 *
	 * ```ts
	 * model.change( writer => {
	 * 	const range = writer.createRange( start, end );
	 * } );
	 * ```
	 *
	 * @param start Start position.
	 * @param end End position. If not set, the range will be collapsed to the `start` position.
	 */
	public createRange( start: ModelPosition, end?: ModelPosition ): ModelRange {
		return new ModelRange( start, end );
	}

	/**
	 * Creates a range inside the given element which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createRangeIn `Writer#createRangeIn()`}:
	 *
	 * ```ts
	 * model.change( writer => {
	 * 	const range = writer.createRangeIn( paragraph );
	 * } );
	 * ```
	 *
	 * @param element Element which is a parent for the range.
	 */
	public createRangeIn( element: ModelElement | ModelDocumentFragment ): ModelRange {
		return ModelRange._createIn( element );
	}

	/**
	 * Creates a range that starts before the given {@link module:engine/model/item~Item model item} and ends after it.
	 *
	 * Note: This method is also available on `writer` instance as
	 * {@link module:engine/model/writer~Writer#createRangeOn `Writer.createRangeOn()`}:
	 *
	 * ```ts
	 * model.change( writer => {
	 * 	const range = writer.createRangeOn( paragraph );
	 * } );
	 * ```
	 *
	 * @param item
	 */
	public createRangeOn( item: Item ): ModelRange {
		return ModelRange._createOn( item );
	}

	// The three overloads below where added,
	// because they render better in API Docs than rest parameter with union of tuples type (see the constructor of `Selection`).
	public createSelection(): ModelSelection;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public createSelection( selectable: Selectable, placeOrOffset?: PlaceOrOffset, options?: { backward?: boolean } ): ModelSelection;
	public createSelection( selectable: Selectable, options: { backward?: boolean } ): ModelSelection;

	/**
	 * Creates a new selection instance based on the given {@link module:engine/model/selection~Selectable selectable}
	 * or creates an empty selection if no arguments were passed.
	 *
	 * Note: This method is also available as
	 * {@link module:engine/model/writer~Writer#createSelection `Writer#createSelection()`}.
	 *
	 * ```ts
	 * // Creates empty selection without ranges.
	 * const selection = writer.createSelection();
	 *
	 * // Creates selection at the given range.
	 * const range = writer.createRange( start, end );
	 * const selection = writer.createSelection( range );
	 *
	 * // Creates selection at the given ranges
	 * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 * const selection = writer.createSelection( ranges );
	 *
	 * // Creates selection from the other selection.
	 * // Note: It doesn't copies selection attributes.
	 * const otherSelection = writer.createSelection();
	 * const selection = writer.createSelection( otherSelection );
	 *
	 * // Creates selection from the given document selection.
	 * // Note: It doesn't copies selection attributes.
	 * const documentSelection = model.document.selection;
	 * const selection = writer.createSelection( documentSelection );
	 *
	 * // Creates selection at the given position.
	 * const position = writer.createPositionFromPath( root, path );
	 * const selection = writer.createSelection( position );
	 *
	 * // Creates selection at the given offset in the given element.
	 * const paragraph = writer.createElement( 'paragraph' );
	 * const selection = writer.createSelection( paragraph, offset );
	 *
	 * // Creates a range inside an {@link module:engine/model/element~Element element} which starts before the
	 * // first child of that element and ends after the last child of that element.
	 * const selection = writer.createSelection( paragraph, 'in' );
	 *
	 * // Creates a range on an {@link module:engine/model/item~Item item} which starts before the item and ends
	 * // just after the item.
	 * const selection = writer.createSelection( paragraph, 'on' );
	 *
	 * // Additional options (`'backward'`) can be specified as the last argument.
	 *
	 * // Creates backward selection.
	 * const selection = writer.createSelection( range, { backward: true } );
	 * ```
	 */
	public createSelection( ...args: ConstructorParameters<typeof ModelSelection> ): ModelSelection {
		return new ModelSelection( ...args );
	}

	/**
	 * Creates a {@link module:engine/model/batch~Batch} instance.
	 *
	 * **Note:** In most cases creating a batch instance is not necessary as they are created when using:
	 *
	 * * {@link #change `change()`},
	 * * {@link #enqueueChange `enqueueChange()`}.
	 *
	 * @param type {@link module:engine/model/batch~Batch#constructor The type} of the batch.
	 */
	public createBatch( type: BatchType ): Batch {
		return new Batch( type );
	}

	/**
	 * Creates an operation instance from a JSON object (parsed JSON string).
	 *
	 * This is an alias for {@link module:engine/model/operation/operationfactory~OperationFactory.fromJSON `OperationFactory.fromJSON()`}.
	 *
	 * @param json Deserialized JSON object.
	 */
	public createOperationFromJSON( json: unknown ): Operation {
		return OperationFactory.fromJSON( json, this.document );
	}

	/**
	 * Removes all events listeners set by model instance and destroys {@link module:engine/model/document~Document}.
	 */
	public destroy(): void {
		this.document.destroy();
		this.stopListening();
	}

	/**
	 * Common part of {@link module:engine/model/model~Model#change} and {@link module:engine/model/model~Model#enqueueChange}
	 * which calls callbacks and returns array of values returned by these callbacks.
	 *
	 */
	private _runPendingChanges() {
		const ret = [];

		this.fire( '_beforeChanges' );

		try {
			while ( this._pendingChanges.length ) {
				// Create a new writer using batch instance created for this chain of changes.
				const currentBatch = this._pendingChanges[ 0 ].batch;
				this._currentWriter = new Writer( this, currentBatch );

				// Execute changes callback and gather the returned value.
				const callbackReturnValue = this._pendingChanges[ 0 ].callback( this._currentWriter );
				ret.push( callbackReturnValue );

				this.document._handleChangeBlock( this._currentWriter );

				this._pendingChanges.shift();
				this._currentWriter = null;
			}
		} finally {
			this._pendingChanges.length = 0;
			this._currentWriter = null;

			this.fire( '_afterChanges' );
		}

		return ret;
	}
}

/**
 * Fired when entering the outermost {@link module:engine/model/model~Model#enqueueChange} or
 * {@link module:engine/model/model~Model#change} block.
 *
 * @internal
 * @eventName _beforeChanges
 */
export type BeforeChangesEvent = {
	name: '_beforeChanges';
	args: [];
};

/**
 * Fired when leaving the outermost {@link module:engine/model/model~Model#enqueueChange} or
 * {@link module:engine/model/model~Model#change} block.
 *
 * @internal
 * @eventName _afterChanges
 */
export type AfterChangesEvent = {
	name: '_afterChanges';
	args: [];
};

/**
 * Fired every time any {@link module:engine/model/operation/operation~Operation operation} is applied on the model
 * using {@link #applyOperation}.
 *
 * Note that this event is suitable only for very specific use-cases. Use it if you need to listen to every single operation
 * applied on the document. However, in most cases {@link module:engine/model/document~Document#event:change} should
 * be used.
 *
 * A few callbacks are already added to this event by engine internal classes:
 *
 * * with `highest` priority operation is validated,
 * * with `normal` priority operation is executed,
 * * with `low` priority the {@link module:engine/model/document~Document} updates its version,
 * * with `low` priority {@link module:engine/model/liveposition~LivePosition} and {@link module:engine/model/liverange~LiveRange}
 * update themselves.
 *
 * @eventName applyOperation
 * @param args Arguments of the `applyOperation` which is an array with a single element - applied
 * {@link module:engine/model/operation/operation~Operation operation}.
 */
export type ModelApplyOperationEvent = DecoratedMethodEvent<Model, 'applyOperation'>;

/**
 * Event fired when {@link #insertContent} method is called.
 *
 * The {@link #insertContent default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * **Note** The `selectable` parameter for the {@link #insertContent} is optional. When `undefined` value is passed the method uses
 * {@link module:engine/model/document~Document#selection document selection}.
 *
 * @eventName insertContent
 * @param args The arguments passed to the original method.
 */
export type ModelInsertContentEvent = DecoratedMethodEvent<Model, 'insertContent'>;

/**
 * Event fired when the {@link #insertObject} method is called.
 *
 * The {@link #insertObject default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * **Note** The `selectable` parameter for the {@link #insertObject} is optional. When `undefined` value is passed the method uses
 * {@link module:engine/model/document~Document#selection document selection}.
 *
 * @eventName insertObject
 * @param args The arguments passed to the original method.
 */
export type ModelInsertObjectEvent = DecoratedMethodEvent<Model, 'insertObject'>;

/**
 * Event fired when {@link #deleteContent} method is called.
 *
 * The {@link #deleteContent default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @eventName deleteContent
 * @param args The arguments passed to the original method.
 */
export type ModelDeleteContentEvent = DecoratedMethodEvent<Model, 'deleteContent'>;

/**
 * Event fired when {@link #modifySelection} method is called.
 *
 * The {@link #modifySelection default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @eventName modifySelection
 * @param args The arguments passed to the original method.
 */
export type ModelModifySelectionEvent = DecoratedMethodEvent<Model, 'modifySelection'>;

/**
 * Event fired when {@link #getSelectedContent} method is called.
 *
 * The {@link #getSelectedContent default action of that method} is implemented as a
 * listener to this event so it can be fully customized by the features.
 *
 * @eventName getSelectedContent
 * @param args The arguments passed to the original method.
 */
export type ModelGetSelectedContentEvent = DecoratedMethodEvent<Model, 'getSelectedContent'>;
