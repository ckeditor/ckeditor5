/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';

import ClipboardObserver from './clipboardobserver.js';

import plainTextToHtml from './utils/plaintexttohtml.js';
import normalizeClipboardHtml from './utils/normalizeclipboarddata.js';

import HtmlDataProcessor from '../engine/dataprocessor/htmldataprocessor.js';

/**
 * The clipboard feature. Currently, it's only responsible for intercepting the `paste` event and
 * passing the pasted content through the clipboard pipeline.
 *
 * ## Clipboard input pipeline
 *
 * The feature creates the clipboard input pipeline which allows for processing clipboard content
 * before it gets inserted into the editor. The pipeline consists of two events on which
 * the features can listen in order to modify or totally override the default behavior.
 *
 * ### On {@link engine.view.Document#paste}
 *
 * The default action is to:
 *
 * 1. get HTML or plain text from the clipboard,
 * 2. prevent the default action of the native `paste` event,
 * 3. fire {@link engine.view.Document#clipboardInput} with the clipboard data parsed to
 * a {@link engine.view.DocumentFragment view document fragment}.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 * You'd only need to do this when a deeper change in pasting behavior was needed. For example,
 * a feature which wants to differently read data from the clipboard (the {@link clipboard.DataTransfer `DataTransfer`}).
 * should plug a listener at this stage.
 *
 * ### On {@link engine.view.Document#clipboardInput}
 *
 * The default action is to insert the content (`data.content`, represented by a {@link engine.view.DocumentFragment})
 * to an editor if the data is not empty.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the pasted content can be processed by the features. E.g. a feature which wants to transform
 * a pasted text into a link can be implemented in this way:
 *
 *		this.listenTo( editor.editing.view, 'clipboardInput', ( evt, data ) => {
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
 * ## Clipboard output pipeline
 *
 * The output pipeline is the equivalent of the input pipeline but for the copy and cut operations.
 * It allows to process the content which will be then put into the clipboard or overriding the whole process.
 *
 * ### On {@link engine.view.Document#copy} and {@link engine.view.Document#cut}
 *
 * The default action is to:
 *
 * 1. {@link engine.controller.DataController#getSelectedContent get selected content} from the editor,
 * 2. prevent the default action of the native `copy` or `cut` event,
 * 3. fire {@link engine.view.Document#clipboardOutput} with a clone of the selected content
 * converted to a {@link engine.view.DocumentFragment view document fragment},
 * 4. in case of cut operation, delete the selected content.
 *
 * ### On {@link engine.view.Document#clipboardOutput}
 *
 * The default action is to put the content (`data.content`, represented by a {@link engine.view.DocumentFragment})
 * to the clipboard as HTML.
 *
 * This action is performed by a low priority listener, so it can be overridden by a normal one.
 *
 * At this stage the copied/cut content can be processed by the features.
 *
 * @memberOf clipboard
 * @extends core.Feature
 */
export default class Clipboard extends Feature {
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
		 * @member {engine.dataProcessor.HtmlDataProcessor} clipboard.Clipboard#_htmlDataProcessor
		 */
		this._htmlDataProcessor = new HtmlDataProcessor();

		editingView.addObserver( ClipboardObserver );

		// The clipboard paste pipeline.

		this.listenTo( editingView, 'paste', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				content = normalizeClipboardHtml( dataTransfer.getData( 'text/html' ) );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
			}

			content = this._htmlDataProcessor.toView( content );

			data.preventDefault();

			editingView.fire( 'clipboardInput', { dataTransfer, content } );
		}, { priority: 'low' } );

		this.listenTo( editingView, 'clipboardInput', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				const dataController = this.editor.data;

				// Convert the pasted content to a model document fragment.
				// Convertion is contextual, but in this case we need an "all allowed" context and for that
				// we use the $clipboardHolder item.
				const modelFragment = dataController.viewToModel.convert( data.content, {
					context: [ '$clipboardHolder' ]
				} );

				doc.enqueueChanges( () => {
					dataController.insertContent( modelFragment, doc.selection );
				} );
			}
		}, { priority: 'low' } );

		// The clipboard copy/cut pipeline.

		const onCopyCut = ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			const content = editor.data.toView( editor.data.getSelectedContent( doc.selection ) );

			data.preventDefault();

			editingView.fire( 'clipboardOutput', { dataTransfer, content } );

			if ( evt.name == 'cut' ) {
				doc.enqueueChanges( () => {
					editor.data.deleteContent( doc.selection, doc.batch(), { merge: true } );
				} );
			}
		};

		this.listenTo( editingView, 'copy', onCopyCut, { priority: 'low' } );
		this.listenTo( editingView, 'cut', onCopyCut, { priority: 'low' } );

		this.listenTo( editingView, 'clipboardOutput', ( evt, data ) => {
			if ( !data.content.isEmpty ) {
				data.dataTransfer.setData( 'text/html', this._htmlDataProcessor.toData( data.content ) );
			}
		}, { priority: 'low' } );
	}
}

/**
 * Fired with a content which comes from the clipboard (was pasted or dropped) and
 * should be processed in order to be inserted into the editor.
 * It's part of the {@link clipboard.Clipboard "clipboard pipeline"}.
 *
 * @see clipboard.ClipboardObserver
 * @see clipboard.Clipboard
 * @event engine.view.Document#clipboardInput
 * @param {engine.view.observer.ClipboardInputEventData} data Event data.
 */

/**
 * The value of the {@link engine.view.Document#clipboardInput} event.
 *
 * @class engine.view.observer.ClipboardInputEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {clipboard.DataTransfer} engine.view.observer.ClipboardInputEventData#dataTransfer
 */

/**
 * Content to be inserted into the editor. It can be modified by the event listeners.
 * Read more about the clipboard pipelines in {@link clipboard.Clipboard}.
 *
 * @member {engine.view.DocumentFragment} engine.view.observer.ClipboardInputEventData#content
 */

/**
 * Fired on {@link envine.view.Document#copy} and {@link envine.view.Document#cut} with a copy of selected content.
 * The content can be processed before it ends up in the clipboard. It's part of the {@link clipboard.Clipboard "clipboard pipeline"}.
 *
 * @see clipboard.ClipboardObserver
 * @see clipboard.Clipboard
 * @event engine.view.Document#clipboardOutput
 * @param {engine.view.observer.ClipboardOutputEventData} data Event data.
 */

/**
 * The value of the {@link engine.view.Document#clipboardOutput} event.
 *
 * @class engine.view.observer.ClipboardOutputEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {clipboard.DataTransfer} engine.view.observer.ClipboardOutputEventData#dataTransfer
 */

/**
 * Content to be put into the clipboard. It can be modified by the event listeners.
 * Read more about the clipboard pipelines in {@link clipboard.Clipboard}.
 *
 * @member {engine.view.DocumentFragment} engine.view.observer.ClipboardOutputEventData#content
 */
