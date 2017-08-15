/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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

/**
 * The clipboard feature. Currently, it's responsible for intercepting the `paste` and `drop` events and
 * passing the pasted content through the clipboard pipeline.
 *
 * # Clipboard input pipeline
 *
 * The feature creates the clipboard input pipeline which allows processing clipboard content
 * before it gets inserted into the editor. The pipeline consists of two events on which
 * the features can listen in order to modify or totally override the default behavior.
 *
 * ## On {@link module:engine/view/document~Document#event:paste} and {@link module:engine/view/document~Document#event:drop}
 *
 * The default action is to:
 *
 * 1. get HTML or plain text from the clipboard,
 * 2. prevent the default action of the native `paste` or `drop` event,
 * 3. fire {@link module:engine/view/document~Document#event:clipboardInput} with a
 * {@link module:clipboard/datatransfer~DataTransfer `dataTransfer`} property.
 * 4. fire {@link module:clipboard/clipboard~Clipboard#event:inputTransformation} with a `data` containing the clipboard data parsed to
 * a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
 *
 * These action are performed by a low priority listeners, so they can be overridden by a normal ones
 * when a deeper change in pasting behavior is needed. For example, a feature which wants to differently read
 * data from the clipboard (the {@link module:clipboard/datatransfer~DataTransfer `DataTransfer`}).
 * should plug a listener at this stage.
 *
 * ## On {@link module:engine/view/document~Document#event:clipboardInput}
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the dataTransfer object can be processed by the features, which want to transform the original dataTransform.
 *
 *		this.listenTo( editor.editing.view, 'clipboardInput', ( evt, data ) => {
 *			const content = customTransform( data.dataTransfer.get( 'text/html' ) );
 *			const transformedContent = transform( content );
 *			data.dataTransfer.set( 'text/html', transformedContent );
 *		} );
 *
 * ## On {@link module:clipboard/clipboard~Clipboard#event:inputTransformation}
 *
 * The default action is to insert the content (`data.content`, represented by a
 * {@link module:engine/view/documentfragment~DocumentFragment}) to an editor if the data is not empty.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the pasted content can be processed by the features. E.g. a feature which wants to transform
 * a pasted text into a link can be implemented in this way:
 *
 *		this.listenTo( editor.plugins.get( 'Clipboard' ), 'inputTransformation', ( evt, data ) => {
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
 * ## On {@link module:engine/view/document~Document#event:copy} and {@link module:engine/view/document~Document#event:cut}
 *
 * The default action is to:
 *
 * 1. {@link module:engine/controller/datacontroller~DataController#getSelectedContent get selected content} from the editor,
 * 2. prevent the default action of the native `copy` or `cut` event,
 * 3. fire {@link module:engine/view/document~Document#event:clipboardOutput} with a clone of the selected content
 * converted to a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
 *
 * ## On {@link module:engine/view/document~Document#event:clipboardOutput}
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
		const doc = editor.document;
		const editingView = editor.editing.view;

		/**
		 * Data processor used to convert pasted HTML to a view structure.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor} #_htmlDataProcessor
		 */
		this._htmlDataProcessor = new HtmlDataProcessor();

		editingView.addObserver( ClipboardObserver );

		// The clipboard paste pipeline.

		this.listenTo( editingView, 'clipboardInput', ( evt, data ) => {
			// Pasting and dropping is disabled when editor is read-only.
			// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
			if ( editor.isReadOnly ) {
				return;
			}

			const dataTransfer = data.dataTransfer;
			let content = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				content = normalizeClipboardHtml( dataTransfer.getData( 'text/html' ) );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
			}

			content = this._htmlDataProcessor.toView( content );

			this.fire( 'inputTransformation', { content } );

			editingView.scrollToTheSelection();
		}, { priority: 'low' } );

		this.listenTo( this, 'inputTransformation', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				const dataController = this.editor.data;

				// Convert the pasted content to a model document fragment.
				// Conversion is contextual, but in this case we need an "all allowed" context and for that
				// we use the $clipboardHolder item.
				const modelFragment = dataController.toModel( data.content, '$clipboardHolder' );

				doc.enqueueChanges( () => {
					dataController.insertContent( modelFragment, doc.selection );
				} );
			}
		}, { priority: 'low' } );

		// The clipboard copy/cut pipeline.

		function onCopyCut( evt, data ) {
			const dataTransfer = data.dataTransfer;
			const content = editor.data.toView( editor.data.getSelectedContent( doc.selection ) );

			data.preventDefault();

			editingView.fire( 'clipboardOutput', { dataTransfer, content, method: evt.name } );
		}

		this.listenTo( editingView, 'copy', onCopyCut, { priority: 'low' } );
		this.listenTo( editingView, 'cut', ( evt, data ) => {
			// Cutting is disabled when editor is read-only.
			// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
			if ( editor.isReadOnly ) {
				data.preventDefault();
			} else {
				onCopyCut( evt, data );
			}
		}, { priority: 'low' } );

		this.listenTo( editingView, 'clipboardOutput', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				data.dataTransfer.setData( 'text/html', this._htmlDataProcessor.toData( data.content ) );
				data.dataTransfer.setData( 'text/plain', viewToPlainText( data.content ) );
			}

			if ( data.method == 'cut' ) {
				doc.enqueueChanges( () => {
					editor.data.deleteContent( doc.selection, doc.batch() );
				} );
			}
		}, { priority: 'low' } );
	}
}

/**
 * Fired with a `content`, which comes from the clipboard (was pasted or dropped) and
 * should be processed in order to be inserted into the editor.
 * It's part of the {@link module:clipboard/clipboard~Clipboard "clipboard pipeline"}.
 *
 * @see module:clipboard/clipboardobserver~ClipboardObserver
 * @see module:clipboard/clipboard~Clipboard
 * @event module:clipboard/clipboard~Clipboard#event:inputTransformation
 * @param {Object} data Event data.
 * @param {module:engine/view/documentfragment~DocumentFragment} data.content Event data. Content to be inserted into the editor.
 * It can be modified by the event listeners. Read more about the clipboard pipelines in {@link module:clipboard/clipboard~Clipboard}
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
