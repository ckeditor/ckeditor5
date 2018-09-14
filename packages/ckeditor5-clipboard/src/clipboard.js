/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module clipboard/clipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ClipboardObserver from './clipboardobserver';

import plainTextToHtml from './utils/plaintexttohtml';
import normalizeClipboardHtml from './utils/normalizeclipboarddata';
import viewToPlainText from './utils/viewtoplaintext.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

/* eslint-disable max-len */
/**
 * The clipboard feature. Currently, it is responsible for intercepting the `paste` and `drop` events and
 * passing the pasted content through the clipboard pipeline. It also handles the `cut` and `copy` events
 * to fill the native clipboard with serialized editor's data.
 *
 * # Clipboard input pipeline
 *
 * The feature creates the clipboard input pipeline which allows to process clipboard content
 * before it gets inserted into the editor. The pipeline consists of three events on which
 * a feature can listen in order to modify or totally override the default behavior.
 *
 * ## 1. On {@link module:engine/view/document~Document#event:paste `view.Document#paste`} and {@link module:engine/view/document~Document#event:drop `view.Document#drop`}
 *
 * The default action is to:
 *
 * 1. get HTML or plain text from the clipboard,
 * 2. prevent the default action of the native `paste` or `drop` event,
 * 3. fire {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} with a
 * {@link module:clipboard/datatransfer~DataTransfer `dataTransfer`} property.
 * 4. fire {@link module:clipboard/clipboard~Clipboard#event:inputTransformation `view.Document#inputTransformation`}
 * with a `data` containing the clipboard data parsed to
 * a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
 *
 * These actions are performed by low priority listeners, so they can be overridden by normal ones
 * when a deeper change in pasting behavior is needed. For example, a feature which wants to differently read
 * data from the clipboard (the {@link module:clipboard/datatransfer~DataTransfer `DataTransfer`}).
 * should plug a listener at this stage.
 *
 * ## 2. On {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`}
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one. Typically, you will
 * want to call {@link module:utils/eventinfo~EventInfo#stop `evt.stop()`} and implement your desired behavior:
 *
 * 		editor.editing.view.document.on( 'clipboardInput', ( evt, data ) => {
 *			const dataTransfer = data.dataTransfer;
 *			const htmlContent =  dataTransfer.getData( 'text/html' );
 *			const viewContent = htmlDataProcessor.toView( content );
 *
 *			this.fire( 'inputTransformation', { content } );
 *
 *			view.scrollToTheSelection();
 *			evt.stop();
 *		} );
 *
 * The above is a very raw implementation of handling incoming HTML. A complete HTML + plain text + quirks handling is implemented
 * by the [clipboard plugin](https://github.com/ckeditor/ckeditor5-clipboard/blob/master/src/clipboard.js)
 * and it is not recommended to override it, unless you really know what you do.
 *
 * This event is useful, however, if you want to handle other kinds of files and ignore the HTML payload at all:
 *
 * 		editor.editing.view.document.on( 'clipboardInput', ( evt, data ) => {
 *			const dataTransfer = data.dataTransfer;
 *
 *			if ( !hasOnlyFiles( dataTransfer ) ) {
 *				return;
 *			}
 *
 *			for ( const file of dataTransfer.files ) {
 *				editor.model.change( writer => {
 *					// Do something with that file...
 *					// For instance, create a widget with a preview of it.
 *					// PS. For that you'll also need to upload that file.
 *					// See the FileRepository class.
 *
 *					editor.model.insertContent( fileWidget, editor.model.document.selection );
 *				} );
 *
 *			}
 *
 *			evt.stop();
 *		} );
 *
 * In other cases, when you want to transform the pasted HTML, see the event described below.
 *
 * ## 3. On {@link module:clipboard/clipboard~Clipboard#event:inputTransformation `view.Document#inputTransformation`}
 *
 * The default action is to insert the content (`data.content`, represented by a
 * {@link module:engine/view/documentfragment~DocumentFragment}) to an editor if the data is not empty.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the pasted content can be processed by the features. E.g. a feature which wants to transform
 * a pasted text into a link can be implemented in this way:
 *
 *		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', ( evt, data ) => {
 *			if ( data.content.childCount == 1 && isUrlText( data.content.getChild( 0 ) ) ) {
 *				const linkUrl = data.content.getChild( 0 ).data;
 *
 *				data.content = new ViewDocumentFragment( [
 *					ViewElement(
 *						'a',
 *						{ href: linkUrl },
 *						[ new ViewText( linkUrl ) ]
 *					)
 *				] );
 *			}
 *		} );
 *
 * # Clipboard output pipeline
 *
 * The output pipeline is the equivalent of the input pipeline but for the copy and cut operations.
 * It allows to process the content which will be then put into the clipboard or to override the whole process.
 *
 * ## 1. On {@link module:engine/view/document~Document#event:copy `view.Document#copy`} and {@link module:engine/view/document~Document#event:cut `view.Document#cut`}
 *
 * The default action is to:
 *
 * 1. {@link module:engine/model/model~Model#getSelectedContent get selected content} from the editor,
 * 2. prevent the default action of the native `copy` or `cut` event,
 * 3. fire {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardInput`} with
 * a clone of the selected content converted to a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
 *
 * ## 2. On {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`}
 *
 * The default action is to put the content (`data.content`, represented by a
 * {@link module:engine/view/documentfragment~DocumentFragment}) to the clipboard as HTML. In case of the cut operation,
 * the selected content is also deleted from the editor.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the copied/cut content can be processed by the features.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Clipboard extends Plugin {
/* eslint-enable max-len */

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Clipboard';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const modelDocument = editor.model.document;
		const view = editor.editing.view;
		const viewDocument = view.document;

		/**
		 * Data processor used to convert pasted HTML to a view structure.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor} #_htmlDataProcessor
		 */
		this._htmlDataProcessor = new HtmlDataProcessor();

		view.addObserver( ClipboardObserver );

		// The clipboard paste pipeline.

		// Pasting and dropping is disabled when editor is read-only.
		// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
		this.listenTo( viewDocument, 'clipboardInput', evt => {
			if ( editor.isReadOnly ) {
				evt.stop();
			}
		}, { priority: 'highest' } );

		this.listenTo( viewDocument, 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				content = normalizeClipboardHtml( dataTransfer.getData( 'text/html' ) );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
			}

			content = this._htmlDataProcessor.toView( content );

			this.fire( 'inputTransformation', { content, dataTransfer } );

			view.scrollToTheSelection();
		}, { priority: 'low' } );

		this.listenTo( this, 'inputTransformation', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				const dataController = this.editor.data;
				const model = this.editor.model;

				// Convert the pasted content to a model document fragment.
				// Conversion is contextual, but in this case we need an "all allowed" context and for that
				// we use the $clipboardHolder item.
				const modelFragment = dataController.toModel( data.content, '$clipboardHolder' );

				if ( modelFragment.childCount == 0 ) {
					return;
				}

				model.insertContent( modelFragment );
			}
		}, { priority: 'low' } );

		// The clipboard copy/cut pipeline.

		function onCopyCut( evt, data ) {
			const dataTransfer = data.dataTransfer;

			data.preventDefault();

			const content = editor.data.toView( editor.model.getSelectedContent( modelDocument.selection ) );

			viewDocument.fire( 'clipboardOutput', { dataTransfer, content, method: evt.name } );
		}

		this.listenTo( viewDocument, 'copy', onCopyCut, { priority: 'low' } );
		this.listenTo( viewDocument, 'cut', ( evt, data ) => {
			// Cutting is disabled when editor is read-only.
			// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
			if ( editor.isReadOnly ) {
				data.preventDefault();
			} else {
				onCopyCut( evt, data );
			}
		}, { priority: 'low' } );

		this.listenTo( viewDocument, 'clipboardOutput', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				data.dataTransfer.setData( 'text/html', this._htmlDataProcessor.toData( data.content ) );
				data.dataTransfer.setData( 'text/plain', viewToPlainText( data.content ) );
			}

			if ( data.method == 'cut' ) {
				editor.model.deleteContent( modelDocument.selection );
			}
		}, { priority: 'low' } );
	}
}

/**
 * Fired with a `content` and `dataTransfer` objects. The `content` which comes from the clipboard (was pasted or dropped)
 * should be processed in order to be inserted into the editor. The `dataTransfer` object is available
 * in case the transformation functions needs access to a raw clipboard data.
 * It's part of the {@link module:clipboard/clipboard~Clipboard "clipboard pipeline"}.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:clipboard/clipboard~Clipboard#event:inputTransformation
 * @param {Object} data Event data.
 * @param {module:engine/view/documentfragment~DocumentFragment} data.content Event data. Content to be inserted into the editor.
 * It can be modified by the event listeners. Read more about the clipboard pipelines in {@link module:clipboard/clipboard~Clipboard}
 * @param {module:clipboard/datatransfer~DataTransfer} data.dataTransfer Data transfer instance.
 */

/**
 * Fired on {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut}
 * with a copy of selected content. The content can be processed before it ends up in the clipboard.
 * It's part of the {@link module:clipboard/clipboard~Clipboard "clipboard pipeline"}.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:engine/view/document~Document#event:clipboardOutput
 * @param {module:clipboard/clipboard~ClipboardOutputEventData} data Event data.
 */

/**
 * The value of the {@link module:engine/view/document~Document#event:clipboardOutput} event.
 *
 * @class module:clipboard/clipboard~ClipboardOutputEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {module:clipboard/datatransfer~DataTransfer} module:clipboard/clipboard~ClipboardOutputEventData#dataTransfer
 */

/**
 * Content to be put into the clipboard. It can be modified by the event listeners.
 * Read more about the clipboard pipelines in {@link module:clipboard/clipboard~Clipboard}.
 *
 * @member {module:engine/view/documentfragment~DocumentFragment} module:clipboard/clipboard~ClipboardOutputEventData#content
 */

/**
 * Whether the event was triggered by copy or cut operation.
 *
 * @member {'copy'|'cut'} module:clipboard/clipboard~ClipboardOutputEventData#method
 */
