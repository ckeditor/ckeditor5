/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboardpipeline
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import { EventInfo } from '@ckeditor/ckeditor5-utils';

import type {
	DataTransfer,
	DocumentFragment,
	DomEventData,
	Range,
	ViewDocumentFragment,
	ViewRange
} from '@ckeditor/ckeditor5-engine';

import ClipboardObserver, {
	type ClipboardEventData,
	type ViewDocumentCopyEvent,
	type ViewDocumentCutEvent,
	type ViewDocumentClipboardInputEvent
} from './clipboardobserver';

import plainTextToHtml from './utils/plaintexttohtml';
import normalizeClipboardHtml from './utils/normalizeclipboarddata';
import viewToPlainText from './utils/viewtoplaintext';

// Input pipeline events overview:
//
//              ┌──────────────────────┐          ┌──────────────────────┐
//              │     view.Document    │          │     view.Document    │
//              │         paste        │          │         drop         │
//              └───────────┬──────────┘          └───────────┬──────────┘
//                          │                                 │
//                          └────────────────┌────────────────┘
//                                           │
//                                 ┌─────────V────────┐
//                                 │   view.Document  │   Retrieves text/html or text/plain from data.dataTransfer
//                                 │  clipboardInput  │   and processes it to view.DocumentFragment.
//                                 └─────────┬────────┘
//                                           │
//                               ┌───────────V───────────┐
//                               │   ClipboardPipeline   │   Converts view.DocumentFragment to model.DocumentFragment.
//                               │  inputTransformation  │
//                               └───────────┬───────────┘
//                                           │
//                                ┌──────────V──────────┐
//                                │  ClipboardPipeline  │   Calls model.insertContent().
//                                │   contentInsertion  │
//                                └─────────────────────┘
//
//
// Output pipeline events overview:
//
//              ┌──────────────────────┐          ┌──────────────────────┐
//              │     view.Document    │          │     view.Document    │   Retrieves the selected model.DocumentFragment
//              │         copy         │          │          cut         │   and converts it to view.DocumentFragment.
//              └───────────┬──────────┘          └───────────┬──────────┘
//                          │                                 │
//                          └────────────────┌────────────────┘
//                                           │
//                                 ┌─────────V────────┐
//                                 │   view.Document  │   Processes view.DocumentFragment to text/html and text/plain
//                                 │  clipboardOutput │   and stores the results in data.dataTransfer.
//                                 └──────────────────┘
//

/**
 * The clipboard pipeline feature. It is responsible for intercepting the `paste` and `drop` events and
 * passing the pasted content through a series of events in order to insert it into the editor's content.
 * It also handles the `cut` and `copy` events to fill the native clipboard with the serialized editor's data.
 *
 * # Input pipeline
 *
 * The behavior of the default handlers (all at a `low` priority):
 *
 * ## Event: `paste` or `drop`
 *
 * 1. Translates the event data.
 * 2. Fires the {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} event.
 *
 * ## Event: `view.Document#clipboardInput`
 *
 * 1. If the `data.content` event field is already set (by some listener on a higher priority), it takes this content and fires the event
 *    from the last point.
 * 2. Otherwise, it retrieves `text/html` or `text/plain` from `data.dataTransfer`.
 * 3. Normalizes the raw data by applying simple filters on string data.
 * 4. Processes the raw data to {@link module:engine/view/documentfragment~DocumentFragment `view.DocumentFragment`} with the
 *    {@link module:engine/controller/datacontroller~DataController#htmlProcessor `DataController#htmlProcessor`}.
 * 5. Fires the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation
 *   `ClipboardPipeline#inputTransformation`} event with the view document fragment in the `data.content` event field.
 *
 * ## Event: `ClipboardPipeline#inputTransformation`
 *
 * 1. Converts {@link module:engine/view/documentfragment~DocumentFragment `view.DocumentFragment`} from the `data.content` field to
 *    {@link module:engine/model/documentfragment~DocumentFragment `model.DocumentFragment`}.
 * 2. Fires the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`}
 *    event with the model document fragment in the `data.content` event field.
 *    **Note**: The `ClipboardPipeline#contentInsertion` event is fired within a model change block to allow other handlers
 *    to run in the same block without post-fixers called in between (i.e., the selection post-fixer).
 *
 * ## Event: `ClipboardPipeline#contentInsertion`
 *
 * 1. Calls {@link module:engine/model/model~Model#insertContent `model.insertContent()`} to insert `data.content`
 *    at the current selection position.
 *
 * # Output pipeline
 *
 * The behavior of the default handlers (all at a `low` priority):
 *
 * ## Event: `copy`, `cut` or `dragstart`
 *
 * 1. Retrieves the selected {@link module:engine/model/documentfragment~DocumentFragment `model.DocumentFragment`} by calling
 *    {@link module:engine/model/model~Model#getSelectedContent `model#getSelectedContent()`}.
 * 2. Converts the model document fragment to {@link module:engine/view/documentfragment~DocumentFragment `view.DocumentFragment`}.
 * 3. Fires the {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`} event
 *    with the view document fragment in the `data.content` event field.
 *
 * ## Event: `view.Document#clipboardOutput`
 *
 * 1. Processes `data.content` to HTML and plain text with the
 *    {@link module:engine/controller/datacontroller~DataController#htmlProcessor `DataController#htmlProcessor`}.
 * 2. Updates the `data.dataTransfer` data for `text/html` and `text/plain` with the processed data.
 * 3. For the `cut` method, calls {@link module:engine/model/model~Model#deleteContent `model.deleteContent()`}
 *    on the current selection.
 *
 * Read more about the clipboard integration in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
 */
export default class ClipboardPipeline extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ClipboardPipeline' {
		return 'ClipboardPipeline';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;

		view.addObserver( ClipboardObserver );

		this._setupPasteDrop();
		this._setupCopyCut();
	}

	/**
	 * The clipboard paste pipeline.
	 */
	private _setupPasteDrop(): void {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// Pasting and dropping is disabled when editor is in the read-only mode.
		// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
		this.listenTo<ViewDocumentClipboardInputEvent>( viewDocument, 'clipboardInput', evt => {
			if ( editor.isReadOnly ) {
				evt.stop();
			}
		}, { priority: 'highest' } );

		this.listenTo<ViewDocumentClipboardInputEvent>( viewDocument, 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content: ViewDocumentFragment;

			// Some feature could already inject content in the higher priority event handler (i.e., codeBlock).
			if ( data.content ) {
				content = data.content;
			} else {
				let contentData = '';

				if ( dataTransfer.getData( 'text/html' ) ) {
					contentData = normalizeClipboardHtml( dataTransfer.getData( 'text/html' ) );
				} else if ( dataTransfer.getData( 'text/plain' ) ) {
					contentData = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
				}

				content = this.editor.data.htmlProcessor.toView( contentData );
			}

			const eventInfo = new EventInfo( this, 'inputTransformation' );

			this.fire<ClipboardInputTransformationEvent>( eventInfo, {
				content,
				dataTransfer,
				targetRanges: data.targetRanges,
				method: data.method as 'paste' | 'drop'
			} );

			// If CKEditor handled the input, do not bubble the original event any further.
			// This helps external integrations recognize this fact and act accordingly.
			// https://github.com/ckeditor/ckeditor5-upload/issues/92
			if ( eventInfo.stop.called ) {
				evt.stop();
			}

			view.scrollToTheSelection();
		}, { priority: 'low' } );

		this.listenTo<ClipboardInputTransformationEvent>( this, 'inputTransformation', ( evt, data ) => {
			if ( data.content.isEmpty ) {
				return;
			}

			const dataController = this.editor.data;

			// Convert the pasted content into a model document fragment.
			// The conversion is contextual, but in this case an "all allowed" context is needed
			// and for that we use the $clipboardHolder item.
			const modelFragment = dataController.toModel( data.content, '$clipboardHolder' );

			if ( modelFragment.childCount == 0 ) {
				return;
			}

			evt.stop();

			// Fire content insertion event in a single change block to allow other handlers to run in the same block
			// without post-fixers called in between (i.e., the selection post-fixer).
			model.change( () => {
				this.fire<ClipboardContentInsertionEvent>( 'contentInsertion', {
					content: modelFragment,
					method: data.method,
					dataTransfer: data.dataTransfer,
					targetRanges: data.targetRanges
				} );
			} );
		}, { priority: 'low' } );

		this.listenTo<ClipboardContentInsertionEvent>( this, 'contentInsertion', ( evt, data ) => {
			data.resultRange = model.insertContent( data.content );
		}, { priority: 'low' } );
	}

	/**
	 * The clipboard copy/cut pipeline.
	 */
	private _setupCopyCut(): void {
		const editor = this.editor;
		const modelDocument = editor.model.document;
		const view = editor.editing.view;
		const viewDocument = view.document;

		const onCopyCut = ( evt: EventInfo<'copy' | 'cut'>, data: DomEventData<ClipboardEvent> & ClipboardEventData ) => {
			const dataTransfer = data.dataTransfer;

			data.preventDefault();

			const content = editor.data.toView( editor.model.getSelectedContent( modelDocument.selection ) );

			viewDocument.fire<ViewDocumentClipboardOutputEvent>( 'clipboardOutput', {
				dataTransfer,
				content,
				method: evt.name
			} );
		};

		this.listenTo<ViewDocumentCopyEvent>( viewDocument, 'copy', onCopyCut, { priority: 'low' } );
		this.listenTo<ViewDocumentCutEvent>( viewDocument, 'cut', ( evt, data ) => {
			// Cutting is disabled when editor is in the read-only mode.
			// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
			if ( editor.isReadOnly ) {
				data.preventDefault();
			} else {
				onCopyCut( evt, data );
			}
		}, { priority: 'low' } );

		this.listenTo<ViewDocumentClipboardOutputEvent>( viewDocument, 'clipboardOutput', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				data.dataTransfer.setData( 'text/html', this.editor.data.htmlProcessor.toData( data.content ) );
				data.dataTransfer.setData( 'text/plain', viewToPlainText( data.content ) );
			}

			if ( data.method == 'cut' ) {
				editor.model.deleteContent( modelDocument.selection );
			}
		}, { priority: 'low' } );
	}
}

/**
 * Fired with the `content`, `dataTransfer`, `method`, and `targetRanges` properties:
 *
 * * The `content` which comes from the clipboard (it was pasted or dropped) should be processed in order to be inserted into the editor.
 * * The `dataTransfer` object is available in case the transformation functions need access to the raw clipboard data.
 * * The `method` indicates the original DOM event (for example `'drop'` or `'paste'`).
 * * The `targetRanges` property is an array of view ranges (it is available only for `'drop'`).
 *
 * It is a part of the {@glink framework/deep-dive/clipboard#input-pipeline clipboard input pipeline}.
 *
 * **Note**: You should not stop this event if you want to change the input data. You should modify the `content` property instead.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboardpipeline~ClipboardPipeline
 *
 * @eventName ~ClipboardPipeline#inputTransformation
 * @param data The event data.
 */
export type ClipboardInputTransformationEvent = {
	name: 'inputTransformation';
	args: [ data: ClipboardInputTransformationData ];
};

/**
 * The data of 'inputTransformation' event.
 */
export interface ClipboardInputTransformationData {

	/**
	 * The event data.
	 * The content to be inserted into the editor. It can be modified by event listeners. Read more about the clipboard pipelines in
	 * the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
	 */
	content: ViewDocumentFragment;

	/**
	 * The data transfer instance.
	 */
	dataTransfer: DataTransfer;

	/**
	 * The target drop ranges.
	 */
	targetRanges: Array<ViewRange> | null;

	/**
	 * Whether the event was triggered by a paste or a drop operation.
	 */
	method: 'paste' | 'drop';
}

/**
 * Fired with the `content`, `dataTransfer`, `method`, and `targetRanges` properties:
 *
 * * The `content` which comes from the clipboard (was pasted or dropped) should be processed in order to be inserted into the editor.
 * * The `dataTransfer` object is available in case the transformation functions need access to the raw clipboard data.
 * * The `method` indicates the original DOM event (for example `'drop'` or `'paste'`).
 * * The `targetRanges` property is an array of view ranges (it is available only for `'drop'`).
 *
 * Event handlers can modify the content according to the final insertion position.
 *
 * It is a part of the {@glink framework/deep-dive/clipboard#input-pipeline clipboard input pipeline}.
 *
 * **Note**: You should not stop this event if you want to change the input data. You should modify the `content` property instead.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboardpipeline~ClipboardPipeline
 * @see module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation
 *
 * @eventName ~ClipboardPipeline#contentInsertion
 * @param data The event data.
 */
export type ClipboardContentInsertionEvent = {
	name: 'contentInsertion';
	args: [ data: ClipboardContentInsertionData ];
};

/**
 * The data of 'contentInsertion' event.
 */
export interface ClipboardContentInsertionData {

	/**
	 * The content to be inserted into the editor.
	 * Read more about the clipboard pipelines in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
	 */
	content: DocumentFragment;

	/**
	 * Whether the event was triggered by a paste or a drop operation.
	 */
	method: 'paste' | 'drop';

	/**
	 * The data transfer instance.
	 */

	dataTransfer: DataTransfer;

	/**
	 * The target drop ranges.
	 */
	targetRanges: Array<ViewRange> | null;

	/**
	 * The result of the `model.insertContent()` call
	 * (inserted by the event handler at a low priority).
	 */
	resultRange?: Range;
}

/**
 * Fired on {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut}
 * with a copy of the selected content. The content can be processed before it ends up in the clipboard.
 *
 * It is a part of the {@glink framework/deep-dive/clipboard#output-pipeline clipboard output pipeline}.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboardpipeline~ClipboardPipeline
 *
 * @eventName module:engine/view/document~Document#clipboardOutput
 * @param data The event data.
 */
export type ViewDocumentClipboardOutputEvent = {
	name: 'clipboardOutput';
	args: [ data: ViewDocumentClipboardOutputEventData ];
};

/**
 * The value of the 'clipboardOutput' event.
 */
export interface ViewDocumentClipboardOutputEventData {

	/**
	 * The data transfer instance.
	 *
	 * @readonly
	 */
	dataTransfer: DataTransfer;

	/**
	 * Content to be put into the clipboard. It can be modified by the event listeners.
	 * Read more about the clipboard pipelines in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
	 */
	content: ViewDocumentFragment;

	/**
	 * Whether the event was triggered by a copy or cut operation.
	 */
	method: 'copy' | 'cut' | 'dragstart';
}
